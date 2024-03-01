function getId(anime) {
	return anime.getElementsByTagName("series_animedb_id")[0].innerHTML;
}

function getName(anime) {
	return anime.getElementsByTagName("series_title")[0].innerHTML.trim();
}

function getStart(anime) {
	var start = anime.getElementsByTagName("my_start_date")[0].innerHTML;
	return start == "0000-00-00" ? new Date().toISOString().slice(0, 10) : start;
}

function getEnd(anime) {
	var end = anime.getElementsByTagName("my_finish_date")[0].innerHTML;
	return end == "0000-00-00" ? getStart(anime) : end;
}

function getStatus(anime) {
	return "bar status " + anime.getElementsByTagName("my_status")[0].innerHTML
		.toLowerCase()
		.replaceAll(" ", "")
		.replaceAll("-", "");
}

function createMyAnimeChart(form) {

	var file = form.upload.files[0];
	file.text().then((xml) => {

		var parser = new DOMParser();
		var xmldoc = parser.parseFromString(xml, "text/xml");
		var animeList = xmldoc.children.item("myanimelist").children;
		var chartList = [...animeList]
			.filter((node) => {
				return node.nodeName !== "myinfo";
			})
			.map((anime) => {
				return {
					"id": getId(anime),
					"name": getName(anime),
					"start": getStart(anime),
					"end": getEnd(anime),
					"custom_class": getStatus(anime)
				};
			})
			.sort((a, b) => {
				// Gantt charts go top-left to bottom right. This sort accomplishes that.
				return new Date(a.start) - new Date(b.start); 
			});

		var gantt = new Gantt("#gantt", chartList, {
			view_modes: ["Week", "Month", "Year"],
			view_mode: "Month"
		});
	});
}