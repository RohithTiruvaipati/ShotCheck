export function padScene(scene: string): string {
  return scene.toString().padStart(2, '0');
}

export function padShot(shot: string): string {
  return shot.toString().padStart(3, '0');
}

export function makeShotId(scene: string, shot: string): string {
  return `S${padScene(scene)}-S${padShot(shot)}`;
}
