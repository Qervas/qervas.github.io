/**
 * Neural Capture monograph — shared jargon dictionary.
 * Keys longest-first matched by glossary.js (window.OHAO_GLOSSARY name kept for chrome compat).
 */
window.OHAO_GLOSSARY = {
  SfM: {
    expand: "Structure from Motion",
    def: "Recover camera poses and a sparse 3D point cloud from multi-view images by matching features and solving geometry. COLMAP is a common open-source implementation.",
    group: "Photogrammetry",
  },
  MVS: {
    expand: "Multi-View Stereo",
    def: "Dense depth / mesh reconstruction after poses are known. Follows SfM in classical photogrammetry pipelines.",
    group: "Photogrammetry",
  },
  COLMAP: {
    expand: "COLMAP (open SfM/MVS)",
    def: "Widely used Structure-from-Motion and Multi-View Stereo toolkit. In this thesis, pure COLMAP often failed on studio sequences without markers.",
    group: "Photogrammetry",
  },
  RealityCapture: {
    expand: "RealityCapture (Capturing Reality)",
    def: "Commercial photogrammetry software used here for alignment metrics (reprojection error, alignment rate) and meshes.",
    group: "Photogrammetry",
  },
  NeRF: {
    expand: "Neural Radiance Field",
    def: "Scene as a continuous function (x,y,z,view dir) → color and density, trained from multi-view images (Mildenhall et al., 2020).",
    group: "Neural rendering",
  },
  Nerfacto: {
    expand: "Nerfstudio Nerfacto method",
    def: "Default practical NeRF-family recipe in Nerfstudio used for thesis evaluations without custom architecture changes.",
    group: "Neural rendering",
  },
  Splatfacto: {
    expand: "Nerfstudio 3DGS method",
    def: "Gaussian Splatting pipeline in Nerfstudio (Splatfacto) used for real-time-ish explicit reconstruction comparisons.",
    group: "Neural rendering",
  },
  "3DGS": {
    expand: "3D Gaussian Splatting",
    def: "Explicit anisotropic 3D Gaussians optimized from SfM points and rasterized for novel views (Kerbl et al., 2023).",
    group: "Neural rendering",
  },
  PSNR: {
    expand: "Peak Signal-to-Noise Ratio",
    def: "Image similarity metric in dB. Higher is better. Thesis studio averages: Splatfacto ~33.3 dB vs Nerfacto ~22.1 dB.",
    group: "Evaluation",
  },
  ArUco: {
    expand: "ArUco fiducial markers",
    def: "Printed square markers with unique IDs used as viewpoint-independent features so RealityCapture can align when object texture fails.",
    group: "Capture / pose",
  },
  Sapera: {
    expand: "Teledyne DALSA Sapera LT SDK",
    def: "Vendor SDK for GigE industrial cameras. CameraManager wraps discovery, Snap/Wait transfers, and buffer save.",
    group: "Hardware",
  },
  GigE: {
    expand: "Gigabit Ethernet Vision",
    def: "Camera interface over 1 Gbps Ethernet. ~4112×3008 frames are bandwidth-heavy; overlapping Snap without stagger can crash the SDK.",
    group: "Hardware",
  },
  BLE: {
    expand: "Bluetooth Low Energy",
    def: "Wireless link used to command the motorized turntable (scan, connect, rotate, tilt, return-to-zero).",
    group: "Hardware",
  },
  WinUI: {
    expand: "Windows UI Library 3",
    def: "C# frontend stack for the wizard pages (Connect → Setup → Capture → Done).",
    group: "Software",
  },
  "P/Invoke": {
    expand: "Platform Invoke",
    def: "C# interop layer that calls into CaptureCore.dll C exports (CamMatrix_*).",
    group: "Software",
  },
  TIFF: {
    expand: "Tagged Image File Format",
    def: "Lossless-ish capture output (~tens of MB per frame) written under neural_dataset/session/pos_XXX/cam_YY.tiff.",
    group: "Software",
  },
  Snap: {
    expand: "Sapera transfer Snap()",
    def: "Trigger a single frame acquisition into a SapBuffer. Followed by Wait() for completion; sequential Snap+Wait is bandwidth-safe.",
    group: "Hardware",
  },
  "reprojection error": {
    expand: "Mean reprojection error",
    def: "Average pixel distance between observed image points and projected 3D points after alignment. Sub-pixel (0.53–0.76 px) gated studio quality.",
    group: "Evaluation",
  },
};
