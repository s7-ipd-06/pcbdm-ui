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

	process.stdout.write(JSON.stringify(holes))
}
