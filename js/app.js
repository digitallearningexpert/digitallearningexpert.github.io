requestDoc();
requestSheet();

if (window.innerWidth > 1000) {
    document.getElementById("aside-toggle").checked = true;
}

function requestDoc() {	
	id = window.location.hash.replace('#','') || "1qHpCDR9jM434Es_XmIcJ0_l_oh0eHtv7Gd8wJ5QTSRY";
	url = "https://docs.google.com/feeds/download/documents/export/Export?id="+id+"&exportFormat=html"
	var doc = new XMLHttpRequest(); doc.timeout = 10000; doc.open("GET", url, true); doc.send();
	doc.onreadystatechange = function() {
		if (doc.readyState == 4 & doc.status == 200) {
			style = makeStyleLink(doc.responseText.replace(/.*?@import url\('(.*?)'\);.*/g,'$1'));
		    edit = 'https://docs.google.com/document/d/'+id+'/edit';  
		    title = decodeURI(doc.getResponseHeader('Content-Disposition').match(/UTF-8\'\'(.+)\.html/)[1]);
		    content = preparePage(doc.responseText);
		}
		else if (doc.status == 404) {
			edit = '#';
			title = 'Ошибка в ссылке';
		  	content = '<p style="padding-top:10px;">Проверьте адрес или откройте правильную ссылку</p>';
		} 
		else if (doc.status == 0)   {
			edit = '#';
			title = 'Загрузка...';
	  		content = '<p  style="padding-top:10px;">Если страница не загружается долгое время - проверьте доступ к Гугл Диску</p>';
			requestDoc(); // try to retry (
	  } 
	  else {
	  		edit = '#';
	  		title = 'Проблемы с подключением к Гугл Диску';
		  	content = '<p style="padding-top:10px;">Проверьте доступ и обновите страницу</p>';
		}
		makePage(title, content, edit);
	}

	setActiveLink();
}


// следим за изменением url для возможности вернуться назад
window.onhashchange = function() {
	document.querySelector('#title').classList.add('loading');
	document.querySelector('#app').classList.add('loading');
	scrollToTop(500);
  	requestDoc();
}

function preparePage(html) {
	return html
		.replace(/(p|ul){.*?}/g,'')
		.replace(/@import.*?\);/g,'')
		.replace( /(['"])(https:\/\/www\.google\.com\/url\?q=https:\/\/docs.google.com\/document(\/u\/0)*\/d\/)(.*?)(\/edit.*?)(['"])/igm , '#$4' )
		.replace(/<span[^>]*>https\:\/\/youtu\.be\/(.*?)<\/span>/igm,'<p class="responsive-iframe"><iframe width="100%" height="500px !important" src="https://www.youtube.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></p>')
}

function requestSheet(id) {
	var spreadsheetUrl = 'https://spreadsheets.google.com/feeds/cells/161zc8-R7FMxainr1tAq14Hz69KFzvYB0TkxYNsgkQg8/1/public/values?alt=json';
	var sheet = new XMLHttpRequest();
			sheet.open("GET", spreadsheetUrl, true);
			sheet.send();
	sheet.onreadystatechange = function() {
		if (sheet.readyState == 4 ){
			var results = [];
		    var entries = JSON.parse(sheet.responseText).feed.entry;
		    var previousRow = 0;
		    for (var i = 0; i < entries.length; i++) {
		        var latestRow = results[results.length - 1];
		        var cell = entries[i];
		        var text = cell.content.$t;
		        var row = cell.gs$cell.row;
		        if (row > previousRow) {
		            var newRow = [];
		            newRow.push(text);
		            results.push(newRow);
		            previousRow++;
		        } else {
		            latestRow.push(text);
		        }
		    }
	    makeSidebar(results)
		}
	}
}

function makePage(title, content, edit) {
	document.querySelector('#title').innerHTML = title;
	document.querySelector('#title').classList.remove('loading');
	document.querySelector('#app').innerHTML = content;
	document.querySelector('#app').classList.remove('loading');
	document.querySelector('#edit').href = edit;
}

function makeSidebar(links) {
	for (var i = 0; i < links.length; i++) {
		if (links[i][1] == 'folder') {
			elem = document.createElement('li');
			elem.innerHTML = '<input type="checkbox" id="list-item-'+i+'"><label for="list-item-'+i+'">'+links[i][0]+'</label><ul></ul>';
			document.querySelector('#sidenav').appendChild(elem);
		} else {
			elem = document.createElement('li');
			if (links[i][0].startsWith('>')) {
				elem.innerHTML = '<a href="#'+links[i][1].replace(/(https:\/\/drive.google.com\/open\?id=)(.*?)/igm ,'$2')+'">'+links[i][0].replace(/>/igm ,'')+'</a>';
				document.querySelector('#sidenav > li:last-child > ul').appendChild(elem);
			} else {
				elem.innerHTML = '<a href="#'+links[i][1].replace(/(https:\/\/drive.google.com\/open\?id=)(.*?)/igm ,'$2')+'">'+links[i][0]+'</a>';
				document.querySelector('#sidenav').appendChild(elem);
			}			
		}
	}
	setActiveLink();
}

function makeStyleLink(url) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.setAttribute('href', url);
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');
    head.appendChild(link);
}

function setActiveLink() {
	if (document.querySelectorAll("a.current")[0]) {
		document.querySelectorAll("a.current")[0].classList.remove('current');
	}
	if (document.querySelectorAll("a[href='#"+id+"']")[0]) {
		document.querySelectorAll("a[href='#"+id+"']")[0].classList.add('current');
	}
}

function scrollToTop(duration) {
    if (document.scrollingElement.scrollTop === 0) return;
    const cosParameter = document.scrollingElement.scrollTop / 2;
    let scrollCount = 0, oldTimestamp = null;
    function step (newTimestamp) {
        if (oldTimestamp !== null) {
            scrollCount += Math.PI * (newTimestamp - oldTimestamp) / duration;
            if (scrollCount >= Math.PI) return document.scrollingElement.scrollTop = 0;
            document.scrollingElement.scrollTop = cosParameter + cosParameter * Math.cos(scrollCount);
        }
        oldTimestamp = newTimestamp;
        window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
}
