"""
Train a 3D Neural Cellular Automaton that grows (and regrows) a voxel bust of Ayush,
built from the portrait depth map. Exports weights for the in-browser runtime.

  python scripts/nca/train_nca.py --shape bust --iters 1600   # train one shape (~30-50 min on CPU)
  shapes: bust | initials | brain | chip   ->   public/home/nca/<shape>/{meta.json,weights.bin}
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
BRAIN = os.path.join(ROOT, 'public', 'home', 'data', 'brain-silhouette.png')

C = 12          # channels: RGBA + 8 hidden
HID = 64        # MLP hidden units

# name -> (grid x, y, z, label). Each shape is its own tiny model with its own grid.
SHAPES = {
    'bust': (28, 34, 16, 'You'),
    'initials': (40, 22, 12, 'AS'),
    'brain': (36, 30, 12, 'Brain'),
    'chip': (30, 30, 12, 'Chip'),
}
SHAPE = 'bust'
GX, GY, GZ = 28, 34, 16
OUT_DIR = CKPT = ''
SEED = (14, 17, 8)


def configure(shape):
    global SHAPE, GX, GY, GZ, OUT_DIR, CKPT
    SHAPE = shape
    GX, GY, GZ = SHAPES[shape][:3]
    OUT_DIR = os.path.join(ROOT, 'public', 'home', 'nca', shape)
    CKPT = os.path.join(ROOT, 'scripts', 'nca', f'ckpt_{shape}.pt')


def _shade(z, depth):
    return 0.18 + 0.62 * (z / max(1, depth - 1))        # back = dark, front = light


def _fit(img, tw, th):
    """Scale a grayscale PIL image to fit inside (tw, th), keep aspect, centre it. -> float array (th, tw)."""
    w, h = img.size
    k = min(tw / w, th / h)
    nw, nh = max(1, round(w * k)), max(1, round(h * k))
    r = np.asarray(img.resize((nw, nh), Image.LANCZOS), dtype=np.float32) / 255.0
    out = np.zeros((th, tw), np.float32)
    oy, ox = (th - nh) // 2, (tw - nw) // 2
    out[oy:oy + nh, ox:ox + nw] = r
    return out


def target_bust():
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
                g = _shade(z, tz)
                zz, yy, xx = z + 2, (th - 1 - y) + 2, x + 2    # flip y so +y is up
                tgt[:, zz, yy, xx] = (g, g, g, 1.0)
    return torch.from_numpy(tgt)


def target_initials():
    """Extruded 'AS' block letters on a connected base plate (one component, so it can grow from one seed)."""
    from PIL import ImageDraw, ImageFont
    font = ImageFont.truetype('C:/Windows/Fonts/ariblk.ttf', 220)
    im = Image.new('L', (520, 300), 0)
    ImageDraw.Draw(im).text((10, 0), 'AS', font=font, fill=255)
    im = im.crop(im.getbbox())
    tw, th = GX - 4, GY - 8                       # leave room under the letters for the plate
    a = _fit(im, tw, th)
    depth = 6
    tgt = np.zeros((4, GZ, GY, GX), np.float32)
    for y in range(th):
        for x in range(tw):
            if a[y, x] > 0.5:
                for z in range(depth):
                    g = _shade(z, depth)
                    tgt[:, z + 3, (th - 1 - y) + 2 + 3, x + 2] = (g, g, g, 1.0)
    for x in range(2, 2 + tw):                    # base plate, 3 cells high
        for y in range(2, 5):
            for z in range(depth):
                g = _shade(z, depth) * 0.85
                tgt[:, z + 3, y, x] = (g, g, g, 1.0)
    return torch.from_numpy(tgt)


def target_brain():
    """Brain silhouette extruded; thickness follows the image so the folds read as grooves."""
    img = Image.open(BRAIN).convert('L')
    a = _fit(img, GX - 4, GY - 4)
    tgt = np.zeros((4, GZ, GY, GX), np.float32)
    for y in range(a.shape[0]):
        for x in range(a.shape[1]):
            if a[y, x] > 0.42:
                t = 3 + int(round(a[y, x] * 4))
                for z in range(t):
                    g = _shade(z, 7)
                    tgt[:, z + 2, (a.shape[0] - 1 - y) + 2, x + 2] = (g, g, g, 1.0)
    # one seed can only grow one connected piece: keep the largest component
    import scipy.ndimage as ndi
    lab, n = ndi.label(tgt[3] > 0.5, structure=np.ones((3, 3, 3)))
    if n > 1:
        keep = np.argmax(np.bincount(lab.ravel())[1:]) + 1
        tgt[:, lab != keep] = 0
    return torch.from_numpy(tgt)


def target_chip():
    """A microchip: board, raised die, and pins on all four sides."""
    tgt = np.zeros((4, GZ, GY, GX), np.float32)

    def box(x0, x1, y0, y1, z0, z1, k=1.0):
        for z in range(z0, z1):
            g = _shade(z, 6) * k
            tgt[:, z + 2, y0:y1, x0:x1] = np.array([g, g, g, 1.0], np.float32)[:, None, None]

    box(6, 24, 6, 24, 0, 3)            # board
    box(11, 19, 11, 19, 3, 5, 1.1)     # die
    for k in range(5):                 # pins: 5 per side
        o = 8 + k * 3
        box(3, 6, o, o + 2, 0, 2, 0.8)
        box(24, 27, o, o + 2, 0, 2, 0.8)
        box(o, o + 2, 3, 6, 0, 2, 0.8)
        box(o, o + 2, 24, 27, 0, 2, 0.8)
    return torch.from_numpy(tgt)


def build_target():
    return {'bust': target_bust, 'initials': target_initials, 'brain': target_brain, 'chip': target_chip}[SHAPE]()


def pick_seed(target):
    """Seed = the target cell closest to the grid centre (the centre itself for the bust)."""
    c = np.array([GZ // 2, GY // 2, GX // 2])
    alive = np.argwhere((target[3] > 0.5).numpy())
    if len(alive) == 0:
        return (GX // 2, GY // 2, GZ // 2)
    z, y, x = alive[np.argmin(((alive - c) ** 2).sum(1))]
    return (int(x), int(y), int(z))


configure('bust')


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
    x[:, 3:, SEED[2], SEED[1], SEED[0]] = 1.0
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
        'seed': list(SEED), 'shape': SHAPE, 'label': SHAPES[SHAPE][3],
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
    ap.add_argument('--shape', default='bust', choices=list(SHAPES))
    ap.add_argument('--threads', type=int, default=0)
    ap.add_argument('--resume', action='store_true')
    a = ap.parse_args()
    torch.manual_seed(0); np.random.seed(0)
    torch.set_num_threads(a.threads or max(1, os.cpu_count() - 2))
    global SEED
    configure(a.shape)

    target = build_target()
    SEED = pick_seed(target)
    print('shape', a.shape, 'grid', (GX, GY, GZ), 'seed', SEED)
    print('target voxels:', int((target[3] > 0.5).sum()), 'grid', (GX, GY, GZ))
    model = NCA()
    opt = torch.optim.Adam(model.parameters(), lr=2e-3)
    sched = torch.optim.lr_scheduler.MultiStepLR(opt, [int(a.iters * 0.56), int(a.iters * 0.81)], 0.3)
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
