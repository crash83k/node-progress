var Prog = require('../lib/node-progress');

var bar = new Prog({
	total:    10000,
	debounce: 500
	, format: "1 :c[red][:bar]:c[white] ETA: :eta | :current / :total | :opsec/s"
});

bar.onComplete = function() {
	console.log(bar.report);
	process.exit();
};

setInterval(function () {
	bar.tick(1);
	if (bar.curr === 1000) {
		bar.setTick(1500);
	}
}, 5);
//
//var bar2 = new Prog({
//	total:    4000,
//	debounce: 2000
//	, format: "2 [:bar] ETA: :eta | :current / :total | :opsec/s"
//});
//
//setInterval(function () {
//	bar2.tick(1);
//	if (bar2.curr === 1000) {
//		bar2.setTick(1500);
//	}
//}, 3);
//
//
//
//var bar3 = new Prog({
//	total:    5000,
//	debounce: 100
//	, format: "3 :c[blue][:bar]:c[white] ETA: :eta | :current / :total | :opsec/s"
//});
//
//setInterval(function () {
//	bar3.tick(1);
//	if (bar3.curr === 1000) {
//		bar3.setTick(1500);
//	}
//}, 2);