var express = require('express');
var app = express();
var router = express.Router();

router.use(function (req, res, next) {
    console.log('Time:', Date.now());
    next();
});

router.use('/user/:id', function(req, res, next) {
    console.log('Request URL:', req.originalUrl);
    next();
}, function (req, res, next) {
    console.log('Request Type:', req.method);
    next();
});

app.get('/refresh_accounts', function (req, res, next) {
  superagent
    .get('http://xlfans.com/')
    .end(function (err, resHome) {
      if (err) {
        return next(err);
      }
      var $ = cheerio.load(resHome.text);
      var latestElement = $('article').eq(0).children('header').children('h2').children('a');
      var title = latestElement.attr('title');
      var nextURL = latestElement.attr('href');
      console.log(nextURL);
      superagent
        .get(nextURL)
        .end(function (err, resContent) {
          if (err) {
            return next(err)
          }
          console.log('success get HTML Content');
          var $ = cheerio.load(resContent.text);
          var article = $('.article-content');
          var p = article.children('p').filter(function (i, el) {
            //console.log($(this).text().length);
            return $(this).text().length > 150;
          });

          var accounts = [];
          var r = /迅雷粉迅雷会员账号([a-z0-9]+:[1-2]+)密码([0-9]+)\s/g;
          var s = p.text();
          while (true) {
            var match = r.exec(s);
            if (!match) break;
            accounts.push({
              account: match[1],
              password: match[2]
            });
          }
          console.log(accounts);
          res.send(accounts);
        });
    })
});

router.route('/account/:page')
    .get(function (req, res, next) {
    if (req.params.id == 0) next('route');
    else next(); //
}, function (req, res, next) {
    res.send('regular');
});

// handler for /user/:id which renders a special page
router.get('/user/:id', function (req, res, next) {
    console.log(req.params.id);
    res.send('special');
});

// mount the router on the app
app.use('/', router);

app.listen(3000, function(){
    console.log('app start!')
})
