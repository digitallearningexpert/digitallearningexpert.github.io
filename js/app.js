
/*
MAIN

+ заменить линковку с доками на другую
+ поля вокруг контента убить
+ кнопка редактирования
+ обработка ошибок адреса
+ вывести название файла в заголовок
+ боковое меню из файла
+ иконки в боковом меню (эмодзи)
+ в боковом меню ориентироваться на нормальный линки и на ID
+ стремный баг когда файл не догружается -> сделать повторные попытки
+ показывать текущий пункт в меню
= читабельность текста (у меня или в гуглдоке?)

- дизайн райза - больше как приложение
- оффлайн копия в локалсторадже?
- гугл-аналитика
- вложенные папки в боковом меню

*/


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
		if (doc.status == 200) {
		    edit = 'https://docs.google.com/document/d/'+id+'/edit';  
		    title = decodeURI(doc.getResponseHeader('Content-Disposition').match(/UTF-8\'\'(.+)\.html/)[1]);
		    content = doc.responseText.replace(/(p|ul){.*?}/g,'').replace( /(['"])(https:\/\/www\.google\.com\/url\?q=https:\/\/docs.google.com\/document(\/u\/0)*\/d\/)(.*?)(\/edit.*?)(['"])/igm , '#$4' );
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

function requestSheet(id) {
	var spreadsheetUrl = 'https://spreadsheets.google.com/feeds/cells/1zxRfhhW18YLG7V93Ll8st9RglmN2AwHC4hapjHaSwn4/1/public/values?alt=json';
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
		li = document.createElement('li')
		li.innerHTML = '<a href="#'+links[i][1].replace( /(https:\/\/drive.google.com\/open\?id=)(.*?)/igm , '$2' )+'" class="waves-effect">'+links[i][0]+'</a>'
		document.querySelector('#sidenav').appendChild(li)
	}
	setActiveLink();
}

function setActiveLink() {
	if (document.querySelectorAll("a.current")[0]) {
		document.querySelectorAll("a.current")[0].classList.remove('current');
	}
	if (document.querySelectorAll("a[href='#"+id+"']")[0]) {
		document.querySelectorAll("a[href='#"+id+"']")[0].classList.add('current');
	}
}

function scrollToTop (duration) {
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

