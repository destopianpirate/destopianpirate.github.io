"""
Train a 3D Neural Cellular Automaton that grows (and regrows) a voxel bust of Ayush,
built from the portrait depth map. Exports weights for the in-browser runtime.

  python scripts/nca/train_nca.py --iters 1600               # train (~50 min on CPU)
  python scripts/nca/train_nca.py --bench                    # time a few iterations

Model (after Mordvintsev et al. 2020, "Growing Neural Cellular Automata", extended to 3D
like Sudhakaran et al. 2021): each voxel holds C channels (RGBA + hidden). Every step it
perceives itself and 3D Sobel gradients of its 3x3x3 neighbourhood, runs a tiny MLP and
adds the result to its state, stochastically. Cells only live next to "alive" cells.
Trained with a sample pool + damage so the shape is a stable attractor that self-repairs.
"""
import argparse, json, os, time
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEPTH = os.path.join(ROOT, 'public', 'home', 'data', 'portrait-depth.png')
OUT_DIR = os.path.join(ROOT, 'public', 'home', 'nca')
CKPT = os.path.join(ROOT, 'scripts', 'nca', 'nca_ckpt.pt')

C = 12          # channels: RGBA + 8 hidden
HID = 64        # MLP hidden units
GX, GY, GZ = 28, 34, 16   # grid (x, y, z) incl. padding


def build_target():
    """Voxelise the depth-map bust: thickness follows depth (white = near)."""
    img = Image.open(DEPTH).convert('L')
    tw, th, tz = GX - 4, GY - 4, GZ - 4
    img = img.resize((tw, th), Image.BILINEAR)
    d = np.asarray(img, dtype=np.float32) / 255.0
    tgt = np.zeros((4, GZ, GY, GX), np.float32)            # RGBA, (z, y, x)
    for y in range(th):
        for x in range(tw):
            v = d[y, x]
            if v < 0.1:
                continue
            front = int(round((0.3 + 0.7 * v) * (tz - 1)))
            for z in range(front + 1):
                g = 0.18 + 0.62 * (z / max(1, tz - 1))       # back = dark, front = light
                zz, yy, xx = z + 2, (th - 1 - y) + 2, x + 2    # flip y so +y is up
                tgt[:, zz, yy, xx] = (g, g, g, 1.0)
    return torch.from_numpy(tgt)


def sobel_kernels():
    s = torch.tensor([1., 2., 1.])
    dlt = torch.tensor([-1., 0., 1.])
    kx = torch.einsum('i,j,k->ijk', s, s, dlt)   # (z, y, x): derivative along x
    ky = torch.einsum('i,j,k->ijk', s, dlt, s)
    kz = torch.einsum('i,j,k->ijk', dlt, s, s)
    ident = torch.zeros(3, 3, 3); ident[1, 1, 1] = 1
    return torch.stack([ident, kx / 32, ky / 32, kz / 32])   # (4, 3, 3, 3)


class NCA(nn.Module):
    def __init__(self):
        super().__init__()
        k = sobel_kernels()
        self.register_buffer('kern', k.repeat(C, 1, 1, 1).unsqueeze(1))   # (4C,1,3,3,3)
        self.w1 = nn.Conv3d(4 * C, HID, 1)
        self.w2 = nn.Conv3d(HID, C, 1, bias=False)
        nn.init.zeros_(self.w2.weight)

    def alive(self, x):
        return F.max_pool3d(x[:, 3:4], 3, 1, 1) > 0.1

    def forward(self, x, fire=0.5):
        pre = self.alive(x)
        p = F.conv3d(x, self.kern, padding=1, groups=C)
        dx = self.w2(F.relu(self.w1(p)))
        m = (torch.rand_like(x[:, :1]) < fire).float()
        x = x + dx * m
        post = self.alive(x)
        return x * (pre & post).float()


def seed(n):
    x = torch.zeros(n, C, GZ, GY, GX)
    x[:, 3:, GZ // 2, GY // 2, GX // 2] = 1.0
    return x


def damage(x, n):
    for i in range(n):
        c = torch.tensor([np.random.uniform(3, GZ - 3), np.random.uniform(4, GY - 4), np.random.uniform(4, GX - 4)])
        r = np.random.uniform(3, 7)
        zz, yy, xx = torch.meshgrid(torch.arange(GZ), torch.arange(GY), torch.arange(GX), indexing='ij')
        mask = ((zz - c[0]) ** 2 + (yy - c[1]) ** 2 + (xx - c[2]) ** 2) < r * r
        x[i, :, mask] = 0
    return x


def export(model, target, path_dir):
    os.makedirs(path_dir, exist_ok=True)
    w1 = model.w1.weight.detach().reshape(HID, 4 * C).numpy()
    b1 = model.w1.bias.detach().numpy()
    w2 = model.w2.weight.detach().reshape(C, HID).numpy()
    meta = {
        'C': C, 'HID': HID, 'grid': [GX, GY, GZ],
        'seed': [GX // 2, GY // 2, GZ // 2],
        'targetCount': int((target[3] > 0.5).sum()),
        # perception order per channel: [identity, dx, dy, dz]; w1 is (HID, 4C) row-major
    }
    blob = np.concatenate([w1.ravel(), b1.ravel(), w2.ravel()]).astype(np.float32)
    blob.tofile(os.path.join(path_dir, 'weights.bin'))
    with open(os.path.join(path_dir, 'meta.json'), 'w') as f:
        json.dump(meta, f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--iters', type=int, default=1600)
    ap.add_argument('--batch', type=int, default=4)
    ap.add_argument('--bench', action='store_true')
    ap.add_argument('--resume', action='store_true')
    a = ap.parse_args()
    torch.manual_seed(0); np.random.seed(0)
    torch.set_num_threads(max(1, os.cpu_count() - 2))

    target = build_target()
    print('target voxels:', int((target[3] > 0.5).sum()), 'grid', (GX, GY, GZ))
    model = NCA()
    opt = torch.optim.Adam(model.parameters(), lr=2e-3)
    sched = torch.optim.lr_scheduler.MultiStepLR(opt, [900, 1300], 0.3)
    start = 0
    if a.resume and os.path.exists(CKPT):
        ck = torch.load(CKPT)
        model.load_state_dict(ck['model']); opt.load_state_dict(ck['opt']); start = ck['it']
    pool = seed(160)
    tgt = target.unsqueeze(0)

    iters = 4 if a.bench else a.iters
    t0 = time.time()
    for it in range(start, iters):
        idx = np.random.choice(len(pool), a.batch, replace=False)
        x = pool[idx].clone()
        with torch.no_grad():
            loss_per = ((x[:, :4] - tgt) ** 2).mean(dim=(1, 2, 3, 4))
            order = torch.argsort(loss_per, descending=True)
            x = x[order]
            x[:1] = seed(1)                              # worst sample restarts from a seed
            if it > 300:
                x[-2:] = damage(x[-2:], 2)               # best samples get cut → learn to heal
        steps = np.random.randint(40, 60)
        for _ in range(steps):
            x = model(x)
        loss = ((x[:, :4] - tgt) ** 2).mean()
        opt.zero_grad()
        loss.backward()
        for p in model.parameters():                     # per-parameter gradient normalisation
            if p.grad is not None:
                p.grad /= p.grad.norm() + 1e-8
        opt.step(); sched.step()
        pool[idx] = x.detach()[torch.argsort(order)]
        if it % 25 == 0 or a.bench:
            el = time.time() - t0
            print(f'it {it:5d} loss {loss.item():.5f} steps {steps} {el / max(1, it - start + 1):.2f}s/it', flush=True)
        if it % 100 == 0 and not a.bench:
            torch.save({'model': model.state_dict(), 'opt': opt.state_dict(), 'it': it + 1}, CKPT)
            export(model, target, OUT_DIR)
    if not a.bench:
        torch.save({'model': model.state_dict(), 'opt': opt.state_dict(), 'it': iters}, CKPT)
        export(model, target, OUT_DIR)
        # quick sanity check: grow from seed and measure IoU of the alpha shape
        with torch.no_grad():
            x = seed(1)
            for _ in range(96):
                x = model(x)
            a_ = x[0, 3] > 0.1; b_ = target[3] > 0.5
            print('IoU after 96 steps:', float((a_ & b_).sum() / (a_ | b_).sum()))
        print('exported to', OUT_DIR)


if __name__ == '__main__':
    main()
