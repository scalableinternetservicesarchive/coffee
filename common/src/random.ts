export function randomColor(): string {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

export function randomBoolean(): boolean {
  return Math.random() >= 0.5
}

export function randomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function randomUser(size?: string): string {
  const gender = randomBoolean() ? 'men' : 'women'
  const num = Math.floor(randomNumber(0, 100))
  if (!size) {
    return `https://randomuser.me/api/portraits/${gender}/${num}.jpg`
  }
  return `https://randomuser.me/api/portraits/${size}/${gender}/${num}.jpg`
}

export function randomImage(width = 800, height = 600): string {
  return `https://source.unsplash.com/random/${width}x${height}`
}
