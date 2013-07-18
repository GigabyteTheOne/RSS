// class RssItems 

function RssItems (settings) {
	this.items = [];
};

RssItems.prototype.load = function () {
	this.items = [];
	if (localStorage.RssItems) {
		var dataArray = JSON.parse(localStorage.RssItems);
		for (var i = 0; i < dataArray.length; i++) {
			var item = dataArray[i];
			this.items.push(new RssItem({ url: item[0], name: item[1]}));
		}
	}
	else {
		this.items.push(new RssItem({ url: "http://habrahabr.ru/rss/hubs/", name: "Habrahabr"}));
		this.items.push(new RssItem({ url: "http://bash.im/rss/", name: "Bash"}));
		this.save();
	}
};

RssItems.prototype.save = function () {
	var dataArray = [];
	for (var i = 0; i < this.items.length; i++) {
		var item = [this.items[i].url, this.items[i].name];
		dataArray.push(item);
	}
	localStorage.RssItems = JSON.stringify(dataArray);
};

// class RssItem

function RssItem (settings) {
	this.url = settings.url;
	this.name = settings.name;
	this.posts = [];
};

RssItem.prototype.load = function (callback) {
	var feed = new google.feeds.Feed(this.url);
	feed.setNumEntries(10);
	feed.load(function (result) {
		if (!result.error) {
			this.posts = [];
			for (var i = 0; i < result.feed.entries.length; i++) {
				var entry = result.feed.entries[i];
				var post = new RssPost({
					title: entry.title,
					link: entry.link,
					description: entry.content
				});
				this.posts.push(post);
			}
			callback(this, { posts: this.posts });
		}
		else {
			alert(result.error.message);
		}
	});
};

RssItem.prototype.loadInfo = function (callback) {
	var feed = new google.feeds.Feed(this.url);
	feed.setNumEntries(0);
	var self = this;
	feed.load(function (result) {
		if (!result.error) {
			self.name = result.feed.title;
			callback(self);
		}
		else {
			alert(result.error.message);
		}
	});
};

// class RssPost

function RssPost (settings) {
	this.title = settings.title;
	this.link = settings.link;
	this.description = settings.description
}


function App ()
{
	this.rssItems = new RssItems();
	this.rssItems.load();

	this.renderLeftMenu();

	document.getElementById("add_button").onclick = this.addButtonOnClick.bind(this);	

	// var button = document.getElementById("add_button");
	// var evt = Utils.addEvent(button, 'click');
	// console.log(evt);
};

App.prototype.renderLeftMenu = function  () {
	var ul = document.getElementById("rss_items");
	ul.innerHTML = "";
	for (var i = 0; i < this.rssItems.items.length; i++) {
		var rssItem = this.rssItems.items[i];
		var li = document.createElement("li");
		var a = document.createElement("a");
		a.innerHTML = (rssItem.name) ? rssItem.name : rssItem.url;
		a.href = "#";
		a.onclick = this.loadContent.bind(this);
		a.data = rssItem;
		li.appendChild(a);
		ul.appendChild(li);
	};
};

App.prototype.loadContent = function (event) {
	event.srcElement.data.load(this.onLoadContent);
	return false;
};

App.prototype.onLoadContent = function (sender, args) {
	var content = document.getElementById("content");
	content.innerHTML = "";

	var ul = document.createElement("ul");
	var posts = args.posts; 
	for (var i = 0; i < posts.length; i++) {
		var post = posts[i];

		var li = document.createElement("li");
		var a = document.createElement("a");
		a.className = "post_title";
		a.innerHTML = post.title;
		a.href = post.link;

		var div = document.createElement("div");
		div.innerHTML = post.description;

		li.appendChild(a);
		li.appendChild(div);
		ul.appendChild(li);
	};
	content.appendChild(ul);
};

App.prototype.addButtonOnClick = function () {
	var input = document.getElementById("url_textbox");
	if (input.value != "") {
		var url = input.value;
		input.value = "";
		var rssItem = new RssItem({ url: url});
		rssItem.loadInfo(this.onItemAdded.bind(this));
	}
};

App.prototype.onItemAdded = function (sender, args) {
	this.rssItems.items.push(sender);
	this.rssItems.save();
	this.renderLeftMenu();
};

// On load 
(function main () {
	var app = new App();
})();
