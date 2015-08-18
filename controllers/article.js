/**
 * Created by qing.liu on 2015/8/17.
 */
var Post = require('../models/post');
var check = require('./checkLogin');
var util = require('util');
exports.index = function(req, res) {
  Post.get(null, function (err, posts) {
    if (err) {
      console.log(err);
      posts = [];
    }
    res.render('index', {
      title: '主页',
      user: req.session.user,
      posts : posts,
      success: req.flash('success'),
      error: req.flash('error')
    });
  });
};

exports.user = function (req, res) {
 // console.log(util.inspect(req.params, 2));
  Post.get(req.params, function (err, posts) {
    if (err) {
      console.log(err);
      posts = [];
    }
    res.render(req.params[1] ? 'article' : 'user', {
      title: req.params[1] || req.params[0] + '的博客',
      user: req.session.user,
      posts : posts,
      success: req.flash('success'),
      error: req.flash('error')
    });
  });
};
exports.post = {
  form : function (req, res) {
    check.isLogin(req, res, 'notLogin');
    res.render('post', {
      title: '发布信息',
      user: req.session.user,
      success: req.flash('success'),
      error: req.flash('error')
    });
  },
  save : function (req, res) {
    check.isLogin(req, res, 'notLogin');
    Post.get({'0':req.session.user.name,'1':req.body['title']},function(err,post){
      if(err){
        req.flash('error',err);
        return res.redirect('back');
      }
      if(post){
        req.flash('error','文章已存在: '+post.title);
        return res.redirect('back');
      }
      var post = new Post({
        name: req.session.user.name,
        title: req.body['title'],
        content: req.body['content']
      });
      post.save(function (err) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        req.flash('success', '发布成功');
        res.redirect('/');
      });
    });
  },
  edit : function(req,res){
    check.isLogin(req, res, 'notLogin');
    var paramId = {id:req.params.id};
    Post.get(paramId, function (err, post) {
      if (err) {
        console.log(err);
        post = [];
      }
      res.render('edit', {
        title: '编辑文章内容',
        user: req.session.user,
        post : post,
        success: req.flash('success'),
        error: req.flash('error')
      });
    });
  },
  update : function (req,res) {
    check.isLogin(req, res, 'notLogin');
    Post.update(req.body['id'],{
      content : req.body['content'],
      time : new Date()
    }, function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/user/'+encodeURI(req.session.user.name)+'/'+encodeURI(req.body['title'])+'/');
      }
      req.flash('success', '编辑成功');
      res.redirect('/user/'+encodeURI(req.session.user.name)+'/'+encodeURI(req.body['title'])+'/');
    })
  },
  remove : function(req,res){
    check.isLogin(req, res, 'notLogin');
    Post.remove(req.params['id'],function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('/user/' + encodeURI(req.session.user.name) + '/');
      }
      req.flash('success','删除成功');
      res.redirect('/user/' + encodeURI(req.session.user.name) + '/');
    })
  }
};



