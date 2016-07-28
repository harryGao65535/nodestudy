var express = require('express');
var router = express.Router();

var crypto = require('crypto');

/*User*/
var User = require('../models/user.js');
/**
 * 引入post
 */
var Post = require('../models/post.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  Post.get(null,function(err,posts){
    if(err){
        posts = [];
    }
    res.render('index', { 
      title: '首页',
      posts : posts
    });
  });
  
});
//用户的主页
router.get('/u/:user',function (req,res) {
  User.get(req.params.user,function(err,user){
    if(!user){
      req.flash('error','用户不存在');
      return res.redirect('/');
    }
    Post.get(user.name,function(err,posts){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('user',{
        title:user.name,
        posts : posts
      });
    });
  });
});
//发表信息
router.post('/post',checkLogin);
router.post('/post',function (req,res) {
  var currentUser = req.session.user;
  var post = new Post(currentUser.name,req.body.post);

  post.save(function (err){
      if(err){
          req.flash('error',err);
          return res.redirect('/');
      }     

      req.flash('success','发表成功');
      console.log("发表成功");
      console.log(currentUser);
      res.redirect('/u/'+currentUser.name);
  });
});
//用户注册
router.get('/reg',checkNotLogin);
router.get('/reg',function (req,res) {
 res.render('reg',{title:'用户注册'});
});
router.post('/reg',checkNotLogin);
router.post('/reg',function (req,res) {

 if(req.body['password-repeat'] != req.body['password'] ){
    req.flash('error','两次口令不一致');
    return res.redirect('/reg');
 }
 //md5 加密
 var md5 = crypto.createHash('md5');
 var password = md5.update(req.body.password).digest('base64');

 var newUser = new User({
		name : req.body.username,
		password:password
	});

 // 检查用户是否存在
 User.get(newUser.name, function (err,user) {
   console.log("检查用户是否存在");
   console.log(err);
    //存在报错
    if(user){
       err ='用户已存在';
    }
    if(err){
       console.log(err);
       req.flash('error',err);     
       return res.redirect('/reg');
    }
    //不存在则新增
    newUser.save(function (err) {      
      if(err){       
          req.flash('error',err);
          return res.redirect('/reg');
      }     

      req.session.user = newUser;
      req.flash('success','注册成功');
      res.redirect('/');

    });
 });

});
//用户登录
router.get('/login',checkNotLogin);
router.get('/login',function (req,res) {
  res.render('login',{title:'用户登入'});
});
router.get('/login',checkNotLogin);
router.post('/login',function (req,res) {
  //生成口令散列值
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');

  User.get(req.body.username,function(err,user){
    if(!user){
      req.flash('error','用户不存在');
      return res.redirect('/login');
    }
    if(user.password != password){
        req.flash('error','用户密码错误');
    }
    req.session.user = user;
    req.flash('success','登陆成功');
    res.redirect('/');
  });
});
//用户登出
router.get('/logout',checkLogin);
router.get('/logout',function (req,res) {
  req.session.user = null;
  req.flash('success','登出成功');
  res.redirect('/');
});

/**
 * 检测用户是否登陆
 */
function checkLogin(req,res,next) {
    if(!req.session.user){
      req.flash('error','未登陆');
      return res.redirect('/login');
    }
    next();
}
/**
 * 检测用户没有登陆
 */
function checkNotLogin(req,res,next) {
    if(req.session.user){
        req.flash('error','已登陆');
        return res.redirect('/')
    }
    next();
}
module.exports = router;
