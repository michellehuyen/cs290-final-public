var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var fs = require('fs');

var posts = require('./posts.json');

var app = express();
var port = process.env.PORT || 3000;

// Thanks https://stackoverflow.com/a/27855234 <3
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function (req, res) {
  res.status(200).render('index', {});
});

app.get('/topics/:topic', function (req, res, next) {
  if (posts[req.params.topic.toLowerCase()]) {
    res.status(200).render('topics', {
      title: req.params.topic.toLowerCase(),
      posts: posts[req.params.topic.toLowerCase()]
    });
  } else {
    next();
  }
});

app.get('/search/:searchString', function (req, res) {
  var arrays = [[], [], [], []];
  var keys = ['arch', 'cars', 'aarons', 'skincare'];

  var substring = req.params.searchString.toLowerCase();

  if (substring) {
    for (var i = 0; i < keys.length; i++) {
      for (var j = 0; j < posts[keys[i]].length; j++) {
        if (posts[keys[i]][j].text.toLowerCase().includes(substring)) {
          arrays[i].push({text: posts[keys[i]][j].text});
        }
        for (var k = 0; k < posts[keys[i]][j].children.length; k++) {
          if (posts[keys[i]][j].children[k].text.toLowerCase().includes(substring)) {
            arrays[i].push({text: posts[keys[i]][j].children[k].text});
          }
        }
      }
    }
  }

  res.status(200).render('search', {
    arch: arrays[0],
    cars: arrays[1],
    aarons: arrays[2],
    skincare: arrays[3]
  });
});

app.post('/comment', function (req, res) {
  var topic = req.body.topic.toLowerCase();
  var id = parseInt(req.body.id);
  var text = req.body.text;

  if (posts[topic] && !isNaN(id) && text) {
    if (id >= 0 && id < posts[topic].length) {
        posts[topic][id].children.push({
          "text": text
        });

        fs.writeFile(
          __dirname + '/posts.json',
          JSON.stringify(posts, null, 2),
          function (err) {
            if (!err) {
              res.status(200).send("Comment made.");
            } else {
              res.status(500).send("Could not save comment.");
            }
          }
        );
      } else res.status(400).send("Bad request.");
    } else res.status(400).send("Bad request.");
});

app.post('/post', function (req, res) {
  var topic = req.body.topic.toLowerCase();
  var text = req.body.text;

  if (posts[topic]) {
    posts[topic].push({
      "text": text,
      "children": []
    });

    fs.writeFile(
      __dirname + '/posts.json',
      JSON.stringify(posts, null, 2),
      function (err) {
        if (!err) {
          res.status(200).send("Comment made.");
        } else {
          res.status(500).send("Could not save comment.");
        }
      }
    );
  } else res.status(400).send("Bad request.");
});

app.post('/report', function (req, res) {
  var text = req.body.text;
  
  if (text) {
    fs.writeFile('/dev/null', text, function (err) {
      if (!err) {
        res.status(200).send("Done");
      } else {
        res.status(500).send("Could not write report");
      }
    });
  } else res.status(400).send("Bad request.");
});

app.get('/about', function (req, res) {
  res.status(200).render('about', {});
});

app.get('/home', function (req, res) {
  res.status(200).render('home', {});
});

app.get('*', function (req, res) {
  res.status(404).render('404', {});
});

app.listen(port, function () {
  console.log("== Server is listening on port", port);
});
