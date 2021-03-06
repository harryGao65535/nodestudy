/***
 * 发表微博
 * 2016.7.28
 */

var mongodb = require('./db');

function Post(username,post,time) {
    this.user = username;
    this.post = post;
    /**
     * 判断time时间是否传入
     */
    if(time){
        this.time = time;
    }else{
        this.time = new Date();
    }
}

module.exports = Post;
/**
 * 存储数据
 */
Post.prototype.save = function save(callback){
    //存入mongdb文档
    var post = {
        user : this.user,
        post : this.post,
        time : this.time
    };
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        // 读取 posts 集合
        db.collection('posts',function (err,collection) {
             if(err){
                mongodb.colse();
                return callback(err);
             }
             // 为user 属性 添加索引
             collection.ensureIndex('user');
             //写入post文档
             collection.insert(post,{safe:true},function (err,post) {
                 mongodb.close();
                 callback(err,post);
                 console.log("写入完成：");
                 console.log(post);
             });
             
        });
    });
}
/**
 * 读取数据
 */
Post.get = function get(username,callback){
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
        
        /**
         * 查找 user 属性为 username 的文档，如果 username 是 null 则匹配全部
         */
        var query = {};
        if(username){
            query.user = username;
        }   
        console.log(query);
        collection.find(query).sort({time:-1}).toArray(function (err,docs) {
            mongodb.close();
            if(err){
                return callback(err,null);
            }
            //封装posts为post对象
            var posts =[];
            console.log("开始封装对象");
            
            docs.forEach(function(doc,index) {
                
                var post = new Post(doc.user,doc.post,doc.time);
                posts.push(post);   
                
            });
            console.log("封装对象完成");
            callback(null,posts);
        });
        
      });
    });
}