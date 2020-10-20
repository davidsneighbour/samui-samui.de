const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');

(async () => {
	const files = await imagemin(['public/**/*.{jpg,jpeg,png}'], 'public/', {
		plugins: [
			imageminJpegtran({
				progressive: true,
				arithmetic: true
			}),
			imageminMozjpeg({
				quality: 75,
				progressive: true,
				arithmetic: true
			}),
			imageminPngquant({
				quality: [0.6, 0.8],
				speed: 1,
				strip: true
			})
		]
	});
})();