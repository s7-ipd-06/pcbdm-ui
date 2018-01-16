let inputBuffer = Buffer([]);

process.stdin.on('data', (buff) => {
	inputBuffer = Buffer.concat([inputBuffer, buff])

	const newLineIndex = inputBuffer.indexOf(0x0A)
	if(newLineIndex != -1) {
		inputBuffer = inputBuffer.slice(0, newLineIndex)
		generate(inputBuffer.toString())
	}
})

function generate(json) {
	const holes = JSON.parse(json)

	const angle = 0.05 * Math.PI

	// Sort diagonally
	holes.sort((a, b) => {
    var ar = rotate(a, angle)
    var br = rotate(b, angle)
		return ar.x - br.x
	})

	process.stdout.write(JSON.stringify(holes))
}

function rotate(point, rotation) {
  const radians = (Math.PI / 180) * rotation
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const nx = cos * point.x + sin * point.y
  const ny = cos * point.y - sin * point.x
  return {
    x: nx,
    y: ny
  }
}