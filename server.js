var express = require("express");
var fs = require("fs");
var server = express();

server.listen("8080",function(err){
	console.log("服务器启动成功")
})

server.use(express.static("./src"))
server.use(express.static("./node_modules"))

server.get("/index",function(request,response){
	fs.readFile("./mock/index.json",function(err,data){
		response.end(data)
	})
})

server.post("/reg",function(request,response){
	//要把前端发来的数据获取到
	//利用request是一个可读流的特性，来读取这个流里面的数据
	//一个流在什么时候开始读取，在on("data")事件开始时
	//一个流什么时候读完，在on("end")事件触发
	var str = ""; //用来装读到的数据
	request.on("data",function(data){
		str += data;
	})
	request.on("end",function(err){
		console.log(str);
		//在在on("end")事件触发后。就取到了完整数据res
		//要把这个res中的数据，写到一个json中
		//1.要往reg.json中写入数据，要先把reg.json的内容读出来
		//-》 “[]”
		fs.readFile("./mock/reg.json",function(err,data){
			//data就是-》 “[]”
			//2.把这个字符串 “[]”，转成一个数组->  []
			var ary = JSON.parse(data);
			//3. 利用数组的push()方法，在末尾增加一项，
			//把res这个字符串转完对象后，加入到数组中
			ary.push(JSON.parse(str));
			//4.把数组重新写回到reg.json中
			fs.writeFile("./mock/reg.json",JSON.stringify(ary),function(err){
				console.log("注册完成");
				//send()和end()基本一样，只不过是什么数据都可以发
				response.send(true)
			})
		})
	})
})


server.post("/test",function(request,response){
	var str = "";
	request.on("data",function(data){
		str += data;
	})
	request.on("end",function(err){
		console.log(str);
		fs.readFile("./mock/reg.json",function(err,data){
			var ary = JSON.parse(data);
			var bool= true;
			for(var i=0;i<ary.length;i++){
				if(ary[i].zh == str){
					//如果能比对上，就表代 服务器中已经有这个电话了，就需要告诉前端，这个电话不可用
					bool = false;
					response.send(false);
				}
			}
			if(bool){
				response.send(true) //代表没有比对上，电话是可用的
			}
		})
	})
})

server.post("/login",function(request,response){
	//把前端发来的数据获取到
	var str = "";
	request.on("data",function(data){
		str += data;
	})
	request.on("end",function(err){
		console.log(str)
		var obj = JSON.parse(str);
		fs.readFile("./mock/reg.json",function(err,data){
			var ary = JSON.parse(data);
			var bool = true;
			for(var i=0;i<ary.length;i++){
				if(ary[i].zh == obj.zh){
					bool = false;
					if(ary[i].pwd == obj.pwd){
						response.send(["ok",ary[i].nc,ary[i].phone])
					}else{
						response.send("密码错误")
					}
				}
			}
			if(bool){
				response.send("账号不存在")
			}
		})
	})
})