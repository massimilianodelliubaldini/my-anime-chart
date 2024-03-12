function getId(anime) {
	return anime.getElementsByTagName("series_animedb_id")[0].innerHTML;
}

function getName(anime) {
	return anime.getElementsByTagName("series_title")[0].innerHTML
		.replaceAll("<![CDATA[", "")
		.replaceAll("]]>", "")
		.trim();
}

// All the date functions ensure a failsafe value of today,
// and that ends do not come before starts.
function getToday() {
	return new Date().toISOString().slice(0, 10);
}

function getStart(anime) {
	var start = anime.getElementsByTagName("my_start_date")[0].innerHTML;
	var end = anime.getElementsByTagName("my_finish_date")[0].innerHTML;
	return start == "0000-00-00" ? (end == "0000-00-00" ? getToday() : end) : start;
}

function getEnd(anime) {
	var start = anime.getElementsByTagName("my_start_date")[0].innerHTML;
	var end = anime.getElementsByTagName("my_finish_date")[0].innerHTML;
	return end == "0000-00-00" ? (start == "0000-00-00" ? getToday() : start) : end;
}

function getBarClass(anime) {
	return anime.getElementsByTagName("my_status")[0].innerHTML
		.replaceAll(" ", "")
		.replaceAll("-", "")
		.toLowerCase();
}

function getStatus(anime) {
	return anime.getElementsByTagName("my_status")[0].innerHTML;
}

function getScore(anime) {
	return anime.getElementsByTagName("my_score")[0].innerHTML;
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
					"custom_class": "bar status " + getBarClass(anime),
					// custom fields below
					"status": getStatus(anime),
					"score": getScore(anime)
				};
			})
			.sort((a, b) => {
				return new Date(a.start) - new Date(b.start); 
			});

		var gantt = new Gantt("#gantt", chartList, {
			view_modes: ["Week", "Month", "Year"],
			view_mode: "Month",
			custom_popup_html: (anime) => {

				var startDate = new Date(anime.start).toDateString();
				var finishDate = new Date(anime.end).toDateString();
				return `
					<div class="popup">
						<h5>${anime.name}</h5>
						<p>${startDate} - ${finishDate}</p>
						<p>Status: ${anime.status}</p>
						<p>Score: ${anime.score}</p>
					</div>
				`;
			}
		});

		document.getElementById("radioTimeWeek").onchange = () => { gantt.change_view_mode("Week"); };
		document.getElementById("radioTimeMonth").onchange = () => { gantt.change_view_mode("Month"); };
		document.getElementById("radioTimeYear").onchange = () => { gantt.change_view_mode("Year"); };

		document.getElementById("radioTimeMonth").checked = "checked";
		document.getElementById("time").style = "display:inline;";
	});
}
