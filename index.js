const fs = require("fs")
const glob = require("glob")
const showdown = require("showdown")

const templates = {}
for (const templateFilePath of glob.sync("templates/**/*.html")) {
	const templateName = templateFilePath.replace(/^templates\//, "").replace(/\.html$/, "")
	console.log(`${templateFilePath} → ${templateName}`)
	templates[templateName] = fs.readFileSync(templateFilePath).toString()
}
console.log("")

const converter = new showdown.Converter({
	metadata: true,
})

for (const mdFilePath of glob.sync("dist/**/*.md")) {
	console.log(`* In: ${mdFilePath}`)
	const html = converter.makeHtml(fs.readFileSync(mdFilePath).toString())
	const metadata = converter.getMetadata()
	const outputFilePath = mdFilePath.replace(/\.md$/, ".html")
	console.log(`* Out: ${outputFilePath}`)
	let output = templates[metadata.template].replace("{{markdown}}", html)
	for (const match of output.match(/({{.*?}})/g)) {
		const key = match.replace("{{", "").replace("}}", "")
		output = output.replace(match, metadata[key])
		if (!metadata[key]) {
			console.log(`${key} is ${metadata[key]}`)
		}
	}
	fs.writeFileSync(outputFilePath, output)
	console.log("")
}
