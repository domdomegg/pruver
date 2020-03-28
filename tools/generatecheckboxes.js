const properties = require('../config/shared/properties.json')

for (const propertyName in properties) {
	console.log(
`<div class="custom-control custom-checkbox">
	<input type="checkbox" class="custom-control-input" id="${propertyName}">
	<label class="custom-control-label" for="${propertyName}"><code>${propertyName}</code>: ${properties[propertyName]}</label>
</div>`
	);
}