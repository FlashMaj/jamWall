/*
 * jamWall v2.0 2018 7.19 FlashMaj
 */

var JamWall;


/*
 * 局部声明
 */
function jamWall_load_init(){
	function Local_jamWall(){
		/*
		 * 配置
		 */
		{	
			//默认功能
			this.autoAlign=true;//自动对齐
			this.showLabel=true;//开启标注
			this.showLabelWithRange=false;//只显示大于单位长度的标注
			//默认参数
			this.rotateSensitivity=0.5;//物件旋转灵敏度,鼠标移动1px物件旋转多少角度
			this.pointRadius=9;//墙体端点半径
			this.wallPointRadius=5;//墙中端点半径，可以设定固定半径,false为根据所在墙宽变化
			this.radiusWidthRatio=1;//当wallPointRadius为false时，此为端点*墙宽倍数
			this.wallWidth=0.1;//墙宽
			this.canvasRatio=1;//每个单位代表的实际长度 初始值
			this.scaleGap=45;//标尺单位像素 也是1.0比例下1m
			//样式参数
			this.scaleLength=10;//边缘标尺线段长度
			this.wallColor="#000";//墙颜色
			this.inDoorColor="rgb(201,210,244)";//室内颜色
			this.scaleTextStyle="20px Microsoft YaHei";//单位距离文字样式
			this.scaleTextColor="rgb(150,150,150)";//左侧提示文字颜色
			this.positionTextStyle="18px Microsoft YaHei";//单位距离文字样式
			this.labelTextColor="rgb(74,5,142)";//标注文字样式颜色
			this.labelTextStyle="100 15px Microsoft YaHei";//标注文字样式
			this.canvasBackgroundColor="rgb(230,230,230)";//画板背景颜色
			this.wallRectColor="rgb(49,212,253)";//矩形工具背景颜色
			this.wallLineColor="rgb(49,212,253)";//直线工具线条颜色
			this.btn_bgColor="rgb(181, 148, 176)";//按钮默认背景颜色
			this.btn_hoverColor="rgb(215, 135, 115)";//鼠标放置在按钮上按钮的颜色
			this.btn_activeColor="rgb(250, 113, 62)";//按钮默认被激活颜色
			this.btn_gap=10;//按钮间隔
			this.btn_width=35;//按钮边长
			this.btn_marginRigth=50;//按钮右边距
			this.slider_length=260;//滑动条长度
			this.slider_width=10;//滑动条宽度
			this.slider_gap=20;//滑动条间距
			this.prompt_bgColor="rgb(230, 229, 182)";//提示框背景颜色
			this.prompt_color="#666"//提示框字体颜色
			this.prompt_font="15px Microsoft YaHei";//提示框字体
			this.prompt_dr=0;//默认右上提示框
			this.prompt_dx=5;//提示框至鼠标位置x偏移
			this.prompt_dy=5;//提示框至鼠标位置y偏移
			this.prompt_lineHeight=25;//提示框行宽
		}
		
		
		/*
		 * function
		 */
		
		var that=this;
		{
			//event
			this.eventManager=new EventManager(that);
			this.show=function(){show(that);};
			this.hidden=function(){hidden(that);};
			this.initArticle=function(spec){initArticle(that,spec)};
			this.cteateArticle=cteateArticle;
			this.changeRatio=function(ratio){
				that.canvasPosition.x-=(ratio-that.canvasRatio)*that.canvas.width/2;
				that.canvasPosition.y-=(ratio-that.canvasRatio)*that.canvas.height/2;
				that.canvasRatio=ratio;
			};
			this.changeWallWidth=function(width){
				that.wallWidth=width;
			};
			this.clear=function(){
				that.vectorPoints=[];
				that.linePoints=[];
				that.aroundWalls=[];
				that.walls=[];
				that.articles=[];
			};
			this.createMenu=function(menuId){
				that.menus[menuId]=[];
				let menu=that.menus[menuId];
				menu.add=function(button){
					menu.splice(menu.length-1,0,button);
				}
				that.menus[menuId].push(new that.Button(menuId,function(){
					that.turnTheMenuBack();
				},function(drawArgs){
					let context=drawArgs.context,
					x0=drawArgs.x0,
					y0=drawArgs.y0,
					width=drawArgs.width;
					
					context.strokeStyle="rgb(18, 202, 230)";
					context.lineWidth=2;
					context.beginPath();
						context.moveTo(x0+9*width/35,y0+width/2);
						context.lineTo(x0+26*width/35,y0+width/2);
						context.stroke();
						context.moveTo(x0+9*width/35,y0+width/2);
						context.lineTo(x0+14*width/35,y0+12.5*width/35);
						context.stroke();
						context.moveTo(x0+9*width/35,y0+width/2);
						context.lineTo(x0+14*width/35,y0+22.5*width/35);
						context.stroke();
					context.closePath();	
				}));
			}
			this.toMenu=function(menuId){
				that.menuIdPath.push(that.menuId);
				that.menuId=menuId;
				that.changeOperation(0);
			};
			this.turnTheMenuBack=function(){
				that.menuId=that.menuIdPath[that.menuIdPath.length-1];
				that.menuIdPath.splice(that.menuIdPath.length-1,1);
			};
			this.changeOperation=function(n){
				that.operation=n;
				switch(n){
					case 0:{
						that.menus[0][0].active=true;
						that.menus[0][1].active=false;
						that.menus[0][2].active=false;
						that.articleSpec=undefined;
						break;
					}
					case 1:{
						that.menus[0][0].active=false;
						that.menus[0][1].active=true;
						that.menus[0][2].active=false;
						break;
					}
					case 2:{
						that.menus[0][0].active=false;
						that.menus[0][1].active=false;
						that.menus[0][2].active=true;
						break;
					}
				}
			};
			this.finish=function(fun){
				this.finishFun=fun;
			};
			this.finishFun=function(){
				alert("请设置完成事件函数。")
			}
			this.updateInfo=function(){
				let arrays = [that.vectorPoints,that.linePoints];
				for(var i=0;i<arrays.length;i++){
					let unitArray=arrays[i];
					for(var j=0;j<unitArray.length;j++){
						let unit = unitArray[j];
						unit.position={
							x:unit.positionByPx.x/that.scaleGap,
							y:unit.positionByPx.y/that.scaleGap
						};
					}
				}
				for(var i=0;i<that.articles.length;i++){
					let article=that.articles[i];
					if(article.spec.direction){
						article.position={
							x:(article.positionByPx.x+(article.height+article.wall.width)/2*Math.cos(article.rotation.y+Math.PI/2*article.direction))/that.scaleGap,
							y:(article.positionByPx.y+(article.height+article.wall.width)/2*Math.sin(article.rotation.y+Math.PI/2*article.direction))/that.scaleGap
						};
					}else{
						article.position={
							x:article.positionByPx.x/that.scaleGap,
							y:article.positionByPx.y/that.scaleGap
						};
					}
				}
			}
		}
		
		/*
		 * init
		 * object
		 */
		{	
			//domElement
			this.domElementContainer=document.createElement("div");
			this.domElementContainer.oncontextmenu=function(){
				return false;
			}
			this.canvas=document.createElement("canvas");
			this.context=this.canvas.getContext("2d");
			
			let container=this.domElementContainer;
			let canvas = this.canvas;
			
			document.body.appendChild(container);
			container.appendChild(canvas);
			container.style.position="fixed";
			container.style.top="0px";
			container.style.left="0px";
			container.style.display="none";
			container.style.zIndex="99";
			canvas.width=window.innerWidth;
			canvas.height=window.innerHeight;
		}
		{
			this.walls=[];//所有的墙
			this.aroundWalls=[];//所有围墙对象
			this.vectorPoints=[];//所有可自由移动端点
			this.linePoints=[];//所有墙上端点
			this.articles=[];//所有物件
			this.menus=[];//所有菜单
			this.sliders=[];//所有滑动条
			this.promptBox={//提示框
				active:false,
				text:"",
				position:{
					x:500,
					y:200
				},
				prompt_dr:that.prompt_dr,
				use:function(x,y,text,prompt_dr){
					that.promptBox.position.x=x;
					that.promptBox.position.y=y;
					that.promptBox.text=text;
					if(text!=""){
						that.promptBox.active=true;
					}else{
						that.promptBox.active=false;
					}
					if(prompt_dr){
						that.promptBox.prompt_dr=prompt_dr;
					}else{
						that.promptBox.prompt_dr=that.prompt_dr;
					}
				}
			}
		}
		
		/*
		 * constructor
		 */
		this.Button=function(menuId,fun,drawOrText,title,prompt_dr){
			this.jamObj=that;
			this.menuId=menuId;
			this.active=false;
			this.bgColor=that.btn_bgColor;
			this.activeColor=that.btn_activeColor;
			this.hoverColor=that.btn_hoverColor;
			this.color=this.bgColor;
			this.index=that.menus[menuId].length;
			this.fun=fun;
			this.height=that.btn_width;
			this.width=that.btn_width;
			if(drawOrText instanceof Function){
				this.draw=drawOrText;
				this.type=0;//icoBtn
			}else{
				this.text=drawOrText;
				this.type=1;//textBtn
			}
			if(title){
				this.title=title;
			}
			this.prompt_dr=(prompt_dr)?prompt_dr:that.prompt_dr;
		}
		this.createSlider=function(fun,spec){
			that.sliders.push(new Slider(that,fun,spec));
		}
		
		
		
		//非二次开发下面代码基本不用看
		//status
		this.mousePosition={
			x:0,
			y:0
		};
		this.active=false;//当前显示状态
		this.operation=0;/*
			 * operation:当前操作状态
			 * 0:移动、添加、删除
			 * 1：矩形操作
			 * 2：直线操作
			 * 3：添加物件
			 */
		this.point0_type=0;
        this.point1_type=0;/*
             * pointN_Type:创建点的类型
             * 配合operation使用
             * 一般根据单击点的位置判断墙两个端点的类型
             */
        this.point_type=0;/* point_Type:操作点的类型
             * 配合operation使用
             */
        this.isMouseDown=false;
        this.mouseDownPosition={x:0,y:0};
		this.wallLine=new WallLine(0,0);//直线工具
		this.wallRect=new WallRect(0,0);//矩形工具
		this.aroundId=1;//自增数字，用以匹配围墙端点
		this.createOperationPoint0=undefined;//被点击的点，用以移动点或新增墙体的操作
		this.createOperationPoint1=undefined;
		this.createOperationWall0=undefined;//被点击的墙，用以新增墙体操作
		this.createOperationWall1=undefined;
		this.activePoint=undefined;//正在被操作的点
		this.activeArticle=undefined;//正在被操作的物件
		this.articleSpec=undefined;//待添加的物件属性
		this.articleMoveDetal={dx:0,dy:0,dr:0};
		this.button=undefined;
		//position
		/*
		 * 坐标转换规则/方法：
		 * getCanvasPosition({x,y},obj);绝对坐标转画布坐标
		 * getAbsolutePosition({x,y},obj);画布坐标转绝对坐标
		 */
		
		this.canvasPosition={//canvas基点偏移坐标
			x:0,
			y:0
		}
		//UI
		this.mouseDownBtn=undefined;//按下状态的按钮
		this.mouseDownSlider=undefined;//按下状态的滑动条
		this.menuIdPath=[0];
		this.menuId=0;
		this.menus[0]=this.menus["0"]=this.menus["primaryMenu"]=[];//主菜单
		this.createMenu("articles");
		this.menus[1]=this.menus["1"]=this.menus["articles"];//物件菜单
		{
			//addButtonForPrimaryMenu
			let Button = that.Button;
			this.menus[0].push(new Button(0,function(btn){//拖拽
				if(!btn.active){
					that.changeOperation(0);
				}
			},function(drawArgs){
				let context=drawArgs.context,
					x0=drawArgs.x0,
					y0=drawArgs.y0,
					width=drawArgs.width;
				context.strokeStyle="rgb(255, 255, 255)";
				context.lineWidth=1;
				context.beginPath();
					context.moveTo(x0+width*10/35,y0+width*10/35);
					context.lineTo(x0+width*18/35,y0+width*25/35);
					context.lineTo(x0+width*20/35,y0+width*20/35);
					context.lineTo(x0+width*25/35,y0+width*18/35);
					context.lineTo(x0+width*10/35,y0+width*10/35);
				context.closePath();
				context.stroke();
			},"拖拽操作",3));this.menus[0][0].active=true;
			this.menus[0].push(new Button(0,function(btn){//矩形操作按钮
				if(!btn.active){
					that.changeOperation(1);
				}else{
					that.changeOperation(0);
				}
			},function(drawArgs){
				let context=drawArgs.context,
					x0=drawArgs.x0,
					y0=drawArgs.y0,
					width=drawArgs.width;
				context.strokeStyle="rgb(255, 255, 255)";
				context.lineWidth=1;
				context.fillStyle="rgb(237, 209, 231)";
				context.fillRect(x0+8*width/35,y0+10*width/35,19*width/35,15*width/35)
				context.strokeRect(x0+8*width/35,y0+10*width/35,19*width/35,15*width/35);
			},"创建围墙",3));
			this.menus[0].push(new Button(0,function(btn){//直线操作按钮
				if(!btn.active){
					that.changeOperation(2);
				}else{
					that.changeOperation(0);
				}
			},function(drawArgs){
				let context=drawArgs.context,
					x0=drawArgs.x0,
					y0=drawArgs.y0,
					width=drawArgs.width;
				context.strokeStyle="rgb(230, 230, 230)";
				context.lineWidth=2;
				context.beginPath();
					context.moveTo(x0+25*width/35,y0+10*width/35);
					context.lineTo(x0+10*width/35,y0+25*width/35);
					context.stroke();
				context.beginPath();
			},"连接/创建墙体",3));
			this.menus[0].push(new Button(0,function(){//添加物件按钮
				that.toMenu(1);
			},function(drawArgs){
				let context=drawArgs.context,
					x0=drawArgs.x0,
					y0=drawArgs.y0,
					width=drawArgs.width;
				context.strokeStyle="rgb(255, 255, 255)";
				context.lineWidth=1;
				context.strokeRect(x0+12*width/35,y0+8*width/35,11*width/35,19*width/35);
				context.strokeStyle="rgb(230, 230, 230)";
				context.beginPath();
					context.moveTo(x0+16*width/35,y0+8*width/35);
					context.lineTo(x0+16*width/35,y0+27*width/35);
					context.stroke();
					context.moveTo(x0+19*width/35,y0+8*width/35);
					context.lineTo(x0+19*width/35,y0+27*width/35);
					context.stroke();
				context.closePath();
			},"添加物件",3));
			this.menus[0].push(new Button(0,function(btn){
				btn.active=!btn.active;
			},function(drawArgs){
				let context=drawArgs.context,
					x0=drawArgs.x0,
					y0=drawArgs.y0,
					width=drawArgs.width;
				context.fillStyle="#DDD";
				context.strokeStyle="rgb(230, 230, 230)";
				context.lineWidth=1;
				context.beginPath();
					for(var j=0;j<3;j++){
						context.moveTo(x0+6*width/35,y0+17.5+(j-1)*6*width/35);
						context.lineTo(x0+29*width/35,y0+17.5+(j-1)*6*width/35);
						context.stroke();
					}
				context.closePath();
				context.fillRect(x0+17*width/35,y0+8.5*width/35,3*width/35,6*width/35);
				context.fillRect(x0+9*width/35,y0+14.5*width/35,3*width/35,6*width/35);
				context.fillRect(x0+24*width/35,y0+20.5*width/35,3*width/35,6*width/35);
				
			},"设置",3));
			this.menus[0].push(new Button(0,function(){//清空
				that.clear();
			},function(drawArgs){
				let context=drawArgs.context,
					x0=drawArgs.x0,
					y0=drawArgs.y0,
					width=drawArgs.width;
				context.strokeStyle="rgb(255, 255, 255)";
				context.lineWidth=1;
				context.strokeRect(x0+8*width/35,y0+8*width/35,19*width/35,19*width/35);
				context.strokeStyle="rgb(230, 230, 230)";
				context.beginPath();
					context.moveTo(x0+8*width/35,y0+8*width/35);
					context.lineTo(x0+27*width/35,y0+27*width/35);
					context.stroke();
					context.moveTo(x0+27*width/35,y0+8*width/35);
					context.lineTo(x0+8*width/35,y0+27*width/35);
					context.stroke();
				context.closePath();
			},"清空画布",3));
			this.menus[0].push(new Button(0,function(){
				//更新坐标;
				that.updateInfo();
				that.finishFun();
			},function(drawArgs){
				let context=drawArgs.context,
					x0=drawArgs.x0,
					y0=drawArgs.y0,
					width=drawArgs.width;
				context.lineWidth=2;
				context.strokeStyle="rgb(166, 226, 43)";
				context.beginPath();
					context.moveTo(x0+width*7/35,y0+width*20/35);
					context.lineTo(x0+width*10/35,y0+width*17/35);
					context.lineTo(x0+width*17/35,y0+width*24/35);
					context.lineTo(x0+width*28/35,y0+width*12/35);
					context.stroke();
				context.closePath();
			},"完成",3));
		}
		{
			//slider
			this.createSlider(that.changeRatio,{
				minValue:0.2,
				maxValue:2,
				defaultValue:1,
				title:"画布比例"
			});
			this.createSlider(that.changeWallWidth,{
				minValue:0.1,
				maxValue:1,
				defaultValue:0.1,
				title:"墙宽"
			});
		}
	}
	JamWall=Local_jamWall;
	
	/*
	 * 局部类、方法
	 */
	
	//绘制
	function draw(obj){
		let canvas = obj.canvas,
			context = obj.context;
		let x0=obj.canvasPosition.x,
			y0=obj.canvasPosition.y;
		//背景
		context.clearRect(0,0,canvas.width,canvas.height);
		context.fillStyle=obj.canvasBackgroundColor;
		context.fillRect(0,0,canvas.width,canvas.height);
		context.lineCap="butt";
		//aroundBackground
		for(var i=0;i<obj.aroundWalls.length;i++){
			//context.fillStyle=(obj.aroundWalls[i].point0_type==1)?obj.inDoorColor:obj.canvasBackgroundColor;
			context.fillStyle=obj.inDoorColor;
			context.beginPath();
			let point0;
			for(var j=0;j<obj.aroundWalls[i].points.length;j++){
				let point=obj.aroundWalls[i].points[j];
				if(!point0){
					point0=point;
					context.moveTo((-x0+point.positionByPx.x)/obj.canvasRatio,(-y0+point.positionByPx.y)/obj.canvasRatio);
				}else{
					context.lineTo((-x0+point.positionByPx.x)/obj.canvasRatio,(-y0+point.positionByPx.y)/obj.canvasRatio);
				}
			}
			context.lineTo((-x0+point0.positionByPx.x)/obj.canvasRatio,(-y0+point0.positionByPx.y)/obj.canvasRatio);
			context.closePath();
			context.fill();
		}
		
		//wallRect
		if(obj.wallRect.active){
			context.fillStyle=obj.wallRectColor;
			context.fillRect((-x0+obj.wallRect.positionByPx.x0)/obj.canvasRatio,(-y0+obj.wallRect.positionByPx.y0)/obj.canvasRatio,(obj.wallRect.positionByPx.x1-obj.wallRect.positionByPx.x0)/obj.canvasRatio,(obj.wallRect.positionByPx.y1-obj.wallRect.positionByPx.y0)/obj.canvasRatio);
		}
		
		//meter
		let meterCount={
			x:canvas.width*obj.canvasRatio/obj.scaleGap+1,
			y:canvas.height*obj.canvasRatio/obj.scaleGap+1
		};
		let gap=obj.scaleGap/obj.canvasRatio;
		
		let basePositionIndex={x:undefined,y:undefined};
		if((obj.canvasPosition.x<=0)&&(obj.canvasPosition.x>=-canvas.width*obj.canvasRatio)){
			basePositionIndex.x=Math.floor(-obj.canvasPosition.x/obj.scaleGap);
		}
		if((obj.canvasPosition.y<=0)&&(obj.canvasPosition.y>=-canvas.height*obj.canvasRatio)){
			basePositionIndex.y=Math.floor(-obj.canvasPosition.y/obj.scaleGap);
		}
		
		for(var i=0;i<=meterCount.x;i++){
			context.lineWidth=0.1;
			context.strokeStyle="#000";
			if(basePositionIndex.x!=undefined&&i==basePositionIndex.x){
				context.strokeStyle="blue";
				context.lineWidth=0.5;
			}
			context.beginPath();
				context.moveTo(-obj.canvasPosition.x/obj.canvasRatio%gap+i*gap,0);
				context.lineTo(-obj.canvasPosition.x/obj.canvasRatio%gap+i*gap,canvas.height);
				context.stroke();
			context.closePath();
		}
		for(var i=0;i<=meterCount.y;i++){
			context.lineWidth=0.1;
			context.strokeStyle="#000";
			if(basePositionIndex.y!=undefined&&i==basePositionIndex.y){
				context.strokeStyle="blue";
				context.lineWidth=0.5;
			}
			context.beginPath();
				context.moveTo(0,i*gap-obj.canvasPosition.y/obj.canvasRatio%gap);
				context.lineTo(canvas.width,i*gap-obj.canvasPosition.y/obj.canvasRatio%gap);
				context.stroke();
			context.closePath();
		}
		
		//wall
		context.strokeStyle=obj.wallColor;
		for(var i=0;i<obj.walls.length;i++){
			let wall=obj.walls[i],
				point0=wall.points[0],
				point1=wall.points[1];
			context.lineWidth=wall.width/obj.canvasRatio;
			context.beginPath();
				context.moveTo((-x0+point0.positionByPx.x)/obj.canvasRatio,(-y0+point0.positionByPx.y)/obj.canvasRatio);
				context.lineTo((-x0+point1.positionByPx.x)/obj.canvasRatio,(-y0+point1.positionByPx.y)/obj.canvasRatio);
				context.stroke();
			context.closePath();
		}
		
		//article
		for(var i=0;i<obj.articles.length;i++){
			let article=obj.articles[i];
			if(article.spec.onFloor){
				context.lineWidth=1;
				context.fillStyle=(article.spec.color)?article.spec.color:"rgba(156,155,151,1)";
				context.strokeStyle="#888";
				
				context.save();
					context.translate((-x0+article.positionByPx.x)/obj.canvasRatio,(-y0+article.positionByPx.y)/obj.canvasRatio);
					context.rotate(article.rotation.y);
					context.fillRect((-article.width/2)/obj.canvasRatio,(-article.height/2)/obj.canvasRatio,(article.width)/obj.canvasRatio,(article.height)/obj.canvasRatio);
					context.strokeRect((-article.width/2)/obj.canvasRatio,(-article.height/2)/obj.canvasRatio,(article.width)/obj.canvasRatio,(article.height)/obj.canvasRatio);
				context.restore();
			}else{
				context.strokeStyle=(article.spec.color)?article.spec.color:"rgba(156,155,151,1)";
				context.lineWidth=article.height/obj.canvasRatio;
				if(article.spec.direction){
					//向direction方向偏移
					let x1=article.positionByPx.x+(article.wall.width+article.height)/2*Math.cos(article.rotation.y+Math.PI/2*article.direction),
						y1=article.positionByPx.y+(article.wall.width+article.height)/2*Math.sin(article.rotation.y+Math.PI/2*article.direction);
					context.beginPath();
						context.moveTo((-x0+x1-article.width/2*Math.cos(article.rotation.y))/obj.canvasRatio,(-y0+y1-article.width/2*Math.sin(article.rotation.y))/obj.canvasRatio);
						context.lineTo((-x0+x1+article.width/2*Math.cos(article.rotation.y))/obj.canvasRatio,(-y0+y1+article.width/2*Math.sin(article.rotation.y))/obj.canvasRatio);
						context.stroke();
					context.closePath();
				}else{
					context.beginPath();
						context.moveTo((-x0+article.positionByPx.x-article.width/2*Math.cos(article.rotation.y))/obj.canvasRatio,(-y0+article.positionByPx.y-article.width/2*Math.sin(article.rotation.y))/obj.canvasRatio);
						context.lineTo((-x0+article.positionByPx.x+article.width/2*Math.cos(article.rotation.y))/obj.canvasRatio,(-y0+article.positionByPx.y+article.width/2*Math.sin(article.rotation.y))/obj.canvasRatio);
						context.stroke();
					context.closePath();
				}
			}
		}
		
		//linePoint
		for(var i=0;i<obj.linePoints.length;i++){
			let point = obj.linePoints[i];
			context.fillStyle="rgb(0,188,150)";
			context.beginPath();
				let r = (obj.wallPointRadius)?obj.wallPointRadius:point.wall.width*obj.radiusWidthRatio;
				context.arc((-x0+point.positionByPx.x)/obj.canvasRatio,(-y0+point.positionByPx.y)/obj.canvasRatio,r,0,Math.PI*2,false);
			context.closePath();
			context.fill();
		}
		
		//vectorPoint
		for(var i=0;i<obj.vectorPoints.length;i++){
			let point = obj.vectorPoints[i];
			context.fillStyle="rgb(180,180,180)";
			context.beginPath();
				context.arc((-x0+point.positionByPx.x)/obj.canvasRatio,(-y0+point.positionByPx.y)/obj.canvasRatio,obj.pointRadius,0,Math.PI*2,false);
			context.closePath();
			context.fill();
			context.fillStyle="#FFF";
			context.beginPath();
				context.arc((-x0+point.positionByPx.x)/obj.canvasRatio,(-y0+point.positionByPx.y)/obj.canvasRatio,obj.pointRadius-4,0,Math.PI*2,false);
			context.closePath();
			context.fill();
		}
		
		//label
		if(obj.showLabel)drawLabel(obj);
		
		//wallLine
		if(obj.wallLine.active){
			context.strokeStyle=obj.wallLineColor;
			context.lineWidth=obj.wallWidth*obj.scaleGap/obj.canvasRatio;
			context.beginPath();
				context.moveTo((-x0+obj.wallLine.positionByPx.x0)/obj.canvasRatio,(-y0+obj.wallLine.positionByPx.y0)/obj.canvasRatio);
				context.lineTo((-x0+obj.wallLine.positionByPx.x1)/obj.canvasRatio,(-y0+obj.wallLine.positionByPx.y1)/obj.canvasRatio);
				context.stroke();
			context.closePath();
		}
		//UI
		//放置物件辅助
		if(obj.operation==3&&obj.articleSpec.onFloor){
			let spec = obj.articleSpec;
			let x=obj.mousePosition.x,
				y=obj.mousePosition.y,
				width=spec.width*obj.scaleGap/obj.canvasRatio,
				height=spec.height*obj.scaleGap/obj.canvasRatio;
			context.lineWidth=1;
			context.fillStyle=(spec.color)?spec.color:"rgba(156,155,151,1)";
			context.globalAlpha=0.5;
			context.strokeStyle="rgb(150,150,150)";
			context.fillRect(x-width/2,y-height/2,width,height);
			context.strokeRect(x-width/2,y-height/2,width,height);
			context.globalAlpha=1;
		}
		//辅助线
		context.strokeStyle="rgb(160, 160, 160)";
		context.lineWidth=2;
		context.beginPath();
			context.moveTo(0,obj.mousePosition.y);
			context.lineTo(canvas.width,obj.mousePosition.y);
			context.stroke();
			context.moveTo(obj.mousePosition.x,0);
			context.lineTo(obj.mousePosition.x,canvas.height);
			context.stroke();
		context.closePath();
		//ruler
		let rulerCount={
			x:canvas.width/obj.scaleGap,
			y:canvas.height/obj.scaleGap
		};
		context.strokeStyle="#000";
		for(var i=1;i<=rulerCount.x;i++){
			context.beginPath();
				context.moveTo(i*obj.scaleGap,0);
				context.lineTo(i*obj.scaleGap,obj.scaleLength);
				context.stroke();
			context.closePath();
		}
		for(var i=1;i<=rulerCount.y;i++){
			context.beginPath();
				context.moveTo(0,i*obj.scaleGap);
				context.lineTo(obj.scaleLength,i*obj.scaleGap);
				context.stroke();
			context.closePath();
		}
		//单位距离说明
		context.strokeStyle="rgb(150,150,150)";
		context.font = obj.scaleTextStyle;
		context.beginPath();
			context.moveTo(obj.scaleLength*2,obj.scaleGap);
			context.lineTo(obj.scaleLength*2+10,obj.scaleGap);
			context.stroke();
			context.moveTo(obj.scaleLength*2,obj.scaleGap*2);
			context.lineTo(obj.scaleLength*2+10,obj.scaleGap*2);
			context.stroke();
			context.moveTo(obj.scaleLength*2+5,obj.scaleGap);
			context.lineTo(obj.scaleLength*2+5,obj.scaleGap*2);
			context.stroke();
		context.closePath();
		let ratioText = obj.canvasRatio.toFixed(2)+"m";
		context.fillStyle=obj.scaleTextColor;
		context.fillText(ratioText,obj.scaleLength*2+10,obj.scaleGap*1.5+8);
		
		//坐标说明	
		context.font=obj.positionTextStyle;
		context.fillStyle=obj.scaleTextColor;
		let str={
			x:"x:"+((obj.mousePosition.x*obj.canvasRatio+obj.canvasPosition.x)/obj.scaleGap).toFixed(2),
			y:"y:"+((obj.mousePosition.y*obj.canvasRatio+obj.canvasPosition.y)/obj.scaleGap).toFixed(2)
		}
		context.fillText(str.x,obj.scaleLength*2,canvas.height-obj.scaleLength*2-20);
		context.fillText(str.y,obj.scaleLength*2,canvas.height-obj.scaleLength*2);
		
		drawMenu(obj);
		if(obj.menus[0][4].active&&((obj.menuId==0)||(obj.menuId=="0")||(obj.menuId=="primaryMenu")))drawSlider(obj);
		if(obj.promptBox.active)drawPromptBox(obj);
	}
	
	function drawMenu(obj){
		let canvas = obj.canvas,
			context = obj.context;
		//menu
		let count=obj.menus[obj.menuId].length;
		let gap=obj.btn_gap,
			marginRight=obj.btn_marginRigth;
		
		for(var i=0;i<count;i++){
			let btn = obj.menus[obj.menuId][i];
			if(btn.draw){
				context.fillStyle=(btn.active)?btn.activeColor:btn.color;
				context.strokeStyle="rgb(160, 160, 160)";
				context.lineWidth=1;
				let width=btn.width;
				getRadiusRectPath(context,canvas.width-(width+marginRight),canvas.height/2+(i-count/2)*(width+gap)+0.5*gap,width,width,5);
				context.fill();
				context.stroke();
				btn.draw({
					canvas:canvas,
					context:context,
					x0:canvas.width-(width+marginRight),
					y0:canvas.height/2+(i-count/2)*(width+gap)+0.5*gap,
					width:width
				});
			}
			if(btn.text){
				context.fillStyle=(btn.active)?btn.activeColor:btn.color;
				context.strokeStyle="rgb(160, 160, 160)";
				context.font = "15px Microsoft YaHei";
				context.lineWidth=1;
				//获取文字长度
				let height=btn.height,
					width = context.measureText(btn.text).width+16;
				btn.width=width;
				getRadiusRectPath(context,canvas.width-(width+marginRight),canvas.height/2+(i-count/2)*(height+gap)+0.5*gap,width,height,5);
				context.fill();
				context.stroke();
				context.fillStyle="#FFF";
				context.fillText(btn.text,canvas.width-(width+marginRight)+8,canvas.height/2+(i-count/2)*(height+gap)+0.5*gap+height-(height-10)/2);
			}
		}
	};
	function drawSlider(obj){
		let context = obj.context,
			canvas=obj.canvas,
			x0=canvas.width-obj.btn_marginRigth-obj.btn_width,
			y0=(canvas.height-obj.slider_length)/2;
		
		for(var i=0;i<obj.sliders.length;i++){
			let slider = obj.sliders[i];
			context.lineCap="round";
			context.lineWidth=obj.slider_width/2;
			context.strokeStyle=obj.btn_activeColor;
			context.beginPath();
				context.moveTo(x0-obj.slider_gap-obj.slider_width/2-i*(obj.slider_gap+obj.slider_width),y0);
				context.lineTo(x0-obj.slider_gap-obj.slider_width/2-i*(obj.slider_gap+obj.slider_width),y0+obj.slider_length);
				context.stroke();
			context.closePath();
			context.strokeStyle="rgb(102, 217, 239)";
			context.fillStyle="#FFF";
			context.lineWidth=2;
			context.beginPath();
				context.arc(x0-obj.slider_gap-obj.slider_width/2-i*(obj.slider_gap+obj.slider_width),y0+obj.slider_length*slider.value,obj.slider_width/2,0,Math.PI*2,false);
				context.fill();
				context.stroke();
			context.closePath();
			
			let str=""+(slider.minValue+(slider.maxValue-slider.minValue)*slider.value).toFixed(2);
			context.font="10px Microsoft YaHei";
			context.fillStyle="rgb(150,150,150)";
			context.fillText(str,x0-obj.slider_gap-obj.slider_width/2-i*(obj.slider_gap+obj.slider_width)-context.measureText(str).width/2,y0-10);
		}
	}
	function drawPromptBox(obj){
		let context = obj.context,
			canvas=obj.canvas,
			promptBox=obj.promptBox;
		context.fillStyle=obj.prompt_bgColor;
		context.lineWidth=1;
		context.strokeStyle="rgb(160, 160, 160)";
		
		context.font=obj.prompt_font;
		let width = context.measureText(promptBox.text).width+10;
		let x,y;
		switch(obj.promptBox.prompt_dr){
			case 0:{
				x=promptBox.position.x+obj.prompt_dx;
				y=promptBox.position.y-obj.prompt_dy-obj.prompt_lineHeight;
				break;
			}
			case 1:{
				x=promptBox.position.x+obj.prompt_dx;
				y=promptBox.position.y+obj.prompt_dy
				break;
			}
			case 2:{
				x=promptBox.position.x-obj.prompt_dx-width;
				y=promptBox.position.y+obj.prompt_dy;
				break;
			}
			case 3:{
				x=promptBox.position.x-obj.prompt_dx-width;
				y=promptBox.position.y-obj.prompt_dy-obj.prompt_lineHeight;
				break;
			}
		}
		getRadiusRectPath(context,x,y,width,obj.prompt_lineHeight,3);
		context.fill();
		context.stroke();
		
		context.fillStyle=obj.prompt_color;
		context.fillText(promptBox.text,x+5,y+obj.prompt_lineHeight-6,width,obj.prompt_lineHeight);
	}
	function drawLabel(obj){
		let gap = 25;
		let context = obj.context,
			canvas=obj.canvas;
		context.font=obj.labelTextStyle;
		for(var i=0;i<obj.walls.length;i++){
			let wall=obj.walls[i],
				length=wall.getLength();
			if(obj.showLabelWithRange&&(length<obj.canvasRatio)){
				continue;
			}
			let	str=length.toFixed(2)+"m",
				width=context.measureText(str).width,
				angle=wall.getRotationY(),
				x0=((wall.points[0].positionByPx.x+wall.points[1].positionByPx.x)/2-obj.canvasPosition.x)/obj.canvasRatio,
				y0=((wall.points[0].positionByPx.y+wall.points[1].positionByPx.y)/2-obj.canvasPosition.y)/obj.canvasRatio,
				x=x0+gap*Math.cos(angle-Math.PI/2),
				y=y0+gap*Math.sin(angle-Math.PI/2);
			context.fillStyle=obj.labelTextColor;
			context.fillText(str,x-width/2,y+8);
		}
	}
	
	//获取圆角矩形路径
	function getRadiusRectPath(context,x,y,w,h,r){
		context.beginPath();
			context.moveTo(x+r,y);
			context.lineTo(x+w-r,y);
			context.arcTo(x+w,y,x+w,y+r,r);
			context.lineTo(x+w,y+h-r);
			context.arcTo(x+w,y+h,x+w-r,y+h,r);
			context.lineTo(x+r,y+h);
			context.arcTo(x,y+h,x,y+h-r,r);
			context.lineTo(x,y+r);
			context.arcTo(x,y,x+r,y,r);
		context.closePath();
	}
	
	//show
	function show(obj){
		obj.active=true;
		obj.domElementContainer.style.display="block";
		addEventListeners(obj);
		animate(obj);
	}
	//hidden
	function hidden(obj){
		obj.active=false;
		obj.domElementContainer.style.display="none";
		removeEventListeners(obj);
	}
	
	//animate
	function animate(obj){
		if(obj.active){
			requestAnimationFrame(function(){
				animate(obj);
			});
			draw(obj);
		}
	}
	
	//eventListener
	function addEventListeners(obj){
		if(!obj.eventManager.listening){
			for(var i=0;i<3;i++){
				let eventListener = obj.eventManager.eventListeners[i];
				window.addEventListener(eventListener.eventName,eventListener,false);
			}
			obj.eventManager.listening=true;
		}
	}
	function removeEventListeners(obj){
		if(obj.eventManager.listening){
			for(var i=0;i<3;i++){
				let eventListener = obj.eventManager.eventListeners[i];
				window.removeEventListener(eventListener.eventName,eventListener);
			}
			obj.eventManager.listening=false;
		}
	}

	//eventManager
	function EventManager(obj){
		this.obj=obj;
		this.listening=false;
		this.eventListeners=[
			function(e){onMouseDown(e,obj);},
			function(e){onMouseUp(e,obj);},
			function(e){onMouseMove(e,obj);}
		];
		this.eventListeners[0].eventName="mousedown";
		this.eventListeners[1].eventName="mouseup";
		this.eventListeners[2].eventName="mousemove";
	}
	
	//event
	function onMouseUp(e,obj){
		let clicked=false;//是否是无移动的单击
		obj.isMouseDown=false;
		let clickSame=false;//是否点击的是同一个墙/点
		let mouseX=e.pageX-obj.canvas.offsetLeft,
			mouseY=e.pageY-obj.canvas.offsetTop;
		let absolutePosition={
			x:mouseX*obj.canvasRatio+obj.canvasPosition.x,
			y:mouseY*obj.canvasRatio+obj.canvasPosition.y
		};
		if(obj.mouseDownPosition.x==mouseX&&obj.mouseDownPosition.y==mouseY){
			onClick(e,obj)
			clicked=true;
		};
		if(e.button==0){
			
			//mouseUpBtn
			for(var i=0;i<obj.menus[obj.menuId].length;i++){
				let btn=obj.menus[obj.menuId][i];
				if(isOnTheBtn(mouseX,mouseY,i,obj)){
					if(obj.mouseDownBtn!=undefined&&obj.mouseDownBtn==i){
						btn.fun(btn);
						break;
					}
				}
			}
			
			switch(obj.operation){
				case 0:{
//					if(!clicked){//replace						
//					}
					break;
				}
				case 1:{
					if(!clicked&&obj.wallRect.active){
						createWall(1,obj,obj.wallRect);
						obj.wallRect.initPosition();
					}
					break;
				}
				case 2:{
					if(!clicked&&obj.wallLine.active){
						if(obj.point1_type==0){
							for(var i=0;i<obj.vectorPoints.length;i++){
								if(isOnTheVectorPoint(absolutePosition.x,absolutePosition.y,obj.vectorPoints[i])){
									obj.createOperationPoint1=obj.vectorPoints[i];
									if(obj.createOperationPoint0==obj.createOperationPoint1){
										clickSame=true;
									}
									obj.point1_type=2;//此处判断点击的是端点
									break;
								}
							}
						}
						if(obj.point1_type==0){
							for(var i=0;i<obj.linePoints.length;i++){
								if(isOnTheLinePoint(absolutePosition.x,absolutePosition.y,obj.linePoints[i])){
									obj.createOperationPoint1=obj.linePoints[i];
									if(obj.createOperationPoint0==obj.createOperationPoint1){
										clickSame=true;
									}
									obj.point1_type=4;//此处判断点击的是墙面点
									break;
								}
							}
						}
						if(obj.point1_type==0){
							for(var i=0;i<obj.walls.length;i++){
								if(isOnTheWall(absolutePosition.x,absolutePosition.y,obj.walls[i])){
									obj.createOperationWall1=obj.walls[i];
									if(obj.createOperationWall0==obj.createOperationWall1){
										clickSame=true;
									}
									obj.point1_type=3;//此处判断点击的是墙体
									break;
								};
							}
						}
						if(obj.point1_type==0){
							obj.point1_type=1;//啥玩意没点着
						}
						if(!clickSame){
							createWall(2,obj,obj.wallLine);
							obj.wallLine.initPosition();
						}
					}
					break;
				}
			}
		}
		if(e.button==2){
			switch(obj.operation){
				case 0:{
					
					break;
				}
				case 3:{
					obj.changeOperation(0);
					break;
				}
			}
		}
		obj.mouseDownBtn=undefined;
		obj.mouseDownSlider=undefined;
		obj.createOperationPoint0=undefined;
		obj.createOperationPoint1=undefined;
		obj.createOperationWall0=undefined;
		obj.createOperationWall1=undefined;
		obj.activePoint=undefined;
		obj.activeArticle=undefined;
		obj.wallRect.active=false;
		obj.wallLine.active=false;
		obj.point0_type=0;
		obj.point1_type=0;
		obj.point_type=0;
		obj.articleMoveDetal.dx=0;
		obj.articleMoveDetal.dy=0;
		obj.articleMoveDetal.dr=0;
	}
	function onMouseDown(e,obj){
		obj.button=e.button;
		obj.isMouseDown=true;
		obj.promptBox.active=false;
		let mouseX=e.pageX-obj.canvas.offsetLeft,
			mouseY=e.pageY-obj.canvas.offsetTop;
		obj.mouseDownPosition.x=mouseX;
		obj.mouseDownPosition.y=mouseY;
		let absolutePosition={
			x:mouseX*obj.canvasRatio+obj.canvasPosition.x,
			y:mouseY*obj.canvasRatio+obj.canvasPosition.y
		};
		if(e.button==0){
			//mouseDownBtn
			for(var i=0;i<obj.menus[obj.menuId].length;i++){
				let btn=obj.menus[obj.menuId][i];
				if(isOnTheBtn(mouseX,mouseY,i,obj)){
					obj.mouseDownBtn=i;
					return;
				}
			}
			if(obj.menus[0][4].active&&((obj.menuId==0)||(obj.menuId=="0")||(obj.menuId=="primaryMenu"))){
				for(var i=0;i<obj.sliders.length;i++){
					let slider = obj.sliders[i];
					if(isOnTheSlider(mouseX,mouseY,i,obj)){
						obj.mouseDownSlider=i;
						return;
					}
				}
			}
			switch(obj.operation){
				case 0:{
					if(obj.point_type==0){
						for(var i=0;i<obj.vectorPoints.length;i++){
							if(isOnTheVectorPoint(absolutePosition.x,absolutePosition.y,obj.vectorPoints[i])){
								obj.activePoint=obj.vectorPoints[i];
								obj.point_type=1;
								break;	
							}
						}
					}
					if(obj.point_type==0){
						for(var i=0;i<obj.linePoints.length;i++){
							if(isOnTheLinePoint(absolutePosition.x,absolutePosition.y,obj.linePoints[i])){
								obj.activePoint=obj.linePoints[i];
								obj.point_type=2;
								break;
							}
						}
					}
					if(obj.point_type==0){
						for(var i=0;i<obj.articles.length;i++){
							let article = obj.articles[i];
							if(isOnTheArticle(absolutePosition.x,absolutePosition.y,article)){
								obj.activeArticle=article;
								if(article.spec.onFloor){
									obj.articleMoveDetal.dx=absolutePosition.x-article.positionByPx.x;
									obj.articleMoveDetal.dy=absolutePosition.y-article.positionByPx.y;
									obj.point_type=3;
								}else{
									let args = getTriangleFormatArgs(absolutePosition.x,absolutePosition.y,article.wall);
									let a=args.a,
										b=args.b,
										c=args.c;
									let s=args.s;
									let h=s*2/c;
									let d=Math.sqrt(Math.pow(a,2)-Math.pow(h,2));
									let ratio=d/c;
									obj.articleMoveDetal.dr=ratio-article.ratio;
									obj.point_type=4;
								}
								break;
							}
						}
					}
					break;
				}
				case 1:{
					obj.wallRect.positionByPx={
						x0:absolutePosition.x,
						y0:absolutePosition.y,
						x1:absolutePosition.x,
						y1:absolutePosition.y
					};
					obj.wallRect.active=true;
					break;
				}
				case 2:{
					if(obj.point0_type==0){
						for(var i=0;i<obj.vectorPoints.length;i++){
							if(isOnTheVectorPoint(absolutePosition.x,absolutePosition.y,obj.vectorPoints[i])){
								obj.createOperationPoint0=obj.vectorPoints[i];
								obj.point0_type=2;//此处判断点击的是端点
								break;
							}
						}
					}
					if(obj.point0_type==0){
						for(var i=0;i<obj.linePoints.length;i++){
							if(isOnTheLinePoint(absolutePosition.x,absolutePosition.y,obj.linePoints[i])){
								obj.createOperationPoint0=obj.linePoints[i];
								obj.point0_type=4;//此处判断点击的是墙面点
								break;	
							}
						}
					}
					if(obj.point0_type==0){
						for(var i=0;i<obj.walls.length;i++){
							if(isOnTheWall(absolutePosition.x,absolutePosition.y,obj.walls[i])){
								obj.createOperationWall0=obj.walls[i];
								obj.point0_type=3;//此处判断点击的是墙体
								break;
							};
						}
					}
					if(obj.point0_type==0){
						obj.point0_type=1;//啥玩意没点着
					}
					obj.wallLine.positionByPx={
						x0:absolutePosition.x,
						y0:absolutePosition.y,
						x1:absolutePosition.x,
						y1:absolutePosition.y
					};
					obj.wallLine.active=true;
					break;
				}
			}
		}
		if(e.button==2){
			switch(obj.operation){
				case 0:{
					if(obj.point_type==0){
						for(var i=0;i<obj.articles.length;i++){
							let article=obj.articles[i]
							if(isOnTheArticle(absolutePosition.x,absolutePosition.y,article)){
								obj.activeArticle=article;
								if(article.spec.onFloor){
									obj.point_type=3;//旋转使用
								}else{
									
								}
								break;	
							}
						}
					}
					break;
				}
			}
		}
	}
	function onMouseMove(e,obj){
		let mouseX=e.pageX-obj.canvas.offsetLeft,
			mouseY=e.pageY-obj.canvas.offsetTop;
		let movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0,
			movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
		let absolutePosition={
			x:mouseX*obj.canvasRatio+obj.canvasPosition.x,
			y:mouseY*obj.canvasRatio+obj.canvasPosition.y
		};
		let promptUsing = false;
		//辅助线
		obj.mousePosition.x=mouseX;obj.mousePosition.y=mouseY;
		//按钮样式
		if(!obj.isMouseDown||obj.mouseDownBtn!=undefined){
			for(var i=0;i<obj.menus[obj.menuId].length;i++){
				let btn = obj.menus[obj.menuId][i];
				if(isOnTheBtn(mouseX,mouseY,i,obj)){
					btn.color=btn.hoverColor;
					if(!promptUsing){
						obj.promptBox.use(mouseX,mouseY,(btn.title)?btn.title:"",btn.prompt_dr);
						promptUsing=true;
					}
					break;
				}else{
					btn.color=btn.bgColor;
				}
			};
		}
		
		if(!obj.isMouseDown){
			//无按下时操作  主要是显示提示框
			if(!promptUsing){
				for(var i=0;i<obj.articles.length;i++){
					let article = obj.articles[i];
					if(isOnTheArticle(absolutePosition.x,absolutePosition.y,article)){
						obj.promptBox.use(mouseX,mouseY,(article.title)?article.title:article.name,(article.spec.prompt_dr)?article.spec.prompt_dr:0);
						promptUsing=true;
					}
				}
			}
			if(!promptUsing&&obj.menus[0][4].active&&((obj.menuId==0)||(obj.menuId=="0")||(obj.menuId=="primaryMenu"))){
				for(var i=0;i<obj.sliders.length;i++){
					let slider = obj.sliders[i];
					if(isOnTheSlider(mouseX,mouseY,i,obj)){
							obj.promptBox.use(mouseX,mouseY,slider.title);
							promptUsing=true;
					}
				}
			}
		}else{
			if(obj.button==0){
				let skipOperation = false;
				//滑动条
				if(obj.mouseDownSlider!=undefined){
					obj.sliders[obj.mouseDownSlider].change(mouseY);
					skipOperation=true;
				}
				if(!skipOperation){
					switch(obj.operation){
						case 0:{
							if(obj.point_type==0){
								obj.canvasPosition.x-=movementX*obj.canvasRatio;
								obj.canvasPosition.y-=movementY*obj.canvasRatio;
							}
							if(obj.point_type==1){
								obj.activePoint.positionByPx.x=absolutePosition.x;
								obj.activePoint.positionByPx.y=absolutePosition.y;
								if(obj.autoAlign){//自动对齐
									for(var i=0;i<obj.vectorPoints.length;i++){
										let vectorPoint = obj.vectorPoints[i];
										if(vectorPoint!=obj.activePoint){
											if((absolutePosition.x>=vectorPoint.positionByPx.x-obj.pointRadius)&&(absolutePosition.x<=vectorPoint.positionByPx.x+obj.pointRadius)){
												obj.activePoint.positionByPx.x=vectorPoint.positionByPx.x;
											}
											if((absolutePosition.y>=vectorPoint.positionByPx.y-obj.pointRadius)&&(absolutePosition.y<=vectorPoint.positionByPx.y+obj.pointRadius)){
												obj.activePoint.positionByPx.y=vectorPoint.positionByPx.y;
											}	
										}
									}
								}
								for(var i=0;i<obj.linePoints.length;i++){
									obj.linePoints[i].updatePosition();
								}
								for(var i=0;i<obj.articles.length;i++){
									if(!obj.articles[i].spec.onFloor){
										obj.articles[i].updatePosition();
										obj.articles[i].updateRotation();
									}
								}
							}
							if(obj.point_type==2){
								let args=getTriangleFormatArgs(absolutePosition.x,absolutePosition.y,obj.activePoint.wall);
								
								let a=args.a,
									b=args.b,
									c=args.c;
								let s=args.s;
								let h=s*2/c;
								let d=Math.sqrt(Math.pow(a,2)-Math.pow(h,2));
								let ratio=d/c;
								if(Math.pow(a,2)+Math.pow(c,2)<Math.pow(b,2))ratio=0;
								if(Math.pow(b,2)+Math.pow(c,2)<Math.pow(a,2))ratio=1;
								obj.activePoint.ratio=ratio;
								
								for(var i=0;i<obj.linePoints.length;i++){
									obj.linePoints[i].updatePosition();
								}
								for(var i=0;i<obj.articles.length;i++){
									if(!obj.articles[i].spec.onFloor){
										obj.articles[i].updatePosition();
										obj.articles[i].updateRotation();
									}
								}
							}
							if(obj.point_type==3){
								obj.activeArticle.positionByPx.x=absolutePosition.x-obj.articleMoveDetal.dx;
								obj.activeArticle.positionByPx.y=absolutePosition.y-obj.articleMoveDetal.dy;
							}
							if(obj.point_type==4){
								let article=obj.activeArticle,
									wallLength=getWallLength(article.wall);
									
								let x=absolutePosition.x-obj.articleMoveDetal.dr*wallLength*Math.cos(article.rotation.y),
									y=absolutePosition.y-obj.articleMoveDetal.dr*wallLength*Math.sin(article.rotation.y);
								
								if(article.spec.direction){
									let args = getTriangleFormatArgs(absolutePosition.x,absolutePosition.y,article.wall),
										a=args.a,
										b=args.b,
										c=args.c,
										h = args.s*2/c;
									let l = Math.sqrt(Math.pow(a,2)-Math.pow(h,2));
									
									//垂足
									let x0,y0;
									if(Math.pow(a,2)+Math.pow(c,2)>=Math.pow(b,2)){
										x0 = article.wall.points[0].positionByPx.x+l*Math.cos(article.rotation.y);
										y0 = article.wall.points[0].positionByPx.y+l*Math.sin(article.rotation.y);
									}else{
										x0 = article.wall.points[0].positionByPx.x-l*Math.cos(article.rotation.y);
										y0 = article.wall.points[0].positionByPx.y-l*Math.sin(article.rotation.y);
									}
									
									let angleOfPoints = getAngle(x0,y0,absolutePosition.x,absolutePosition.y),
										angleOfArticle = article.rotation.y+Math.PI/2;
									
									if(article.wall.points[0].positionByPx.x==article.wall.points[1].positionByPx.x){
										if(Math.cos(angleOfPoints)*Math.cos(angleOfArticle)>=0){
											article.direction=1;
										}else{
											article.direction=-1;
										}
									}else if(article.wall.points[0].positionByPx.y==article.wall.points[1].positionByPx.y){
										if(Math.sin(angleOfPoints)*Math.sin(angleOfArticle)>=0){
											article.direction=1;
										}else{
											article.direction=-1;
										}
									}else{
										if((Math.cos(angleOfPoints)*Math.cos(angleOfArticle)>0)&&(Math.sin(angleOfPoints)*Math.sin(angleOfArticle)>0)){
											article.direction=1;
										}else if((Math.cos(angleOfPoints)*Math.cos(angleOfArticle)<0)&&(Math.sin(angleOfPoints)*Math.sin(angleOfArticle)<0)){
											article.direction=-1;
										}	
									}
								}
									
								let args=getTriangleFormatArgs(x,y,article.wall);
								let a=args.a,
									b=args.b,
									c=args.c;
								let s=args.s;
								let h=s*2/c;
								let d=Math.sqrt(Math.pow(a,2)-Math.pow(h,2));
								let ratio =d/c;
								if(Math.pow(a,2)+Math.pow(c,2)<Math.pow(b,2))ratio=0;
								if(Math.pow(b,2)+Math.pow(c,2)<Math.pow(a,2))ratio=1;
								article.ratio=ratio;
								article.updatePosition();
							}
							break;
						}
						case 1:{
							if(obj.wallRect.active){
								obj.wallRect.positionByPx.x1=absolutePosition.x;
								obj.wallRect.positionByPx.y1=absolutePosition.y;
							}
							break;
						}
						case 2:{
							if(obj.wallLine.active){
								obj.wallLine.positionByPx.x1=absolutePosition.x;
								obj.wallLine.positionByPx.y1=absolutePosition.y;
							}
							break;
						}
					}
				}
			}
			if(obj.button==2){
				switch(obj.operation){
					case 0:{
						if(obj.point_type==3){
							obj.activeArticle.rotation.y=obj.activeArticle.rotation.y+Math.PI*obj.rotateSensitivity/180*movementX;
						}
						break;
					}
				}
			}
		}
		if(!promptUsing){
			obj.promptBox.active=false;
		}
	}
	function onClick(e,obj){
		let mouseX=e.pageX-obj.canvas.offsetLeft,
			mouseY=e.pageY-obj.canvas.offsetTop;
		let absolutePosition={
			x:mouseX*obj.canvasRatio+obj.canvasPosition.x,
			y:mouseY*obj.canvasRatio+obj.canvasPosition.y
		};
		if(e.button==0){
			//判断点击单位
			switch(obj.operation){
				case 0:{
					let clickUnit=false;
					if(!clickUnit){
						for(var i=0;i<obj.vectorPoints.length;i++){
							let point = obj.vectorPoints[i];
							if(isOnTheVectorPoint(absolutePosition.x,absolutePosition.y,point)){
								clickUnit=true;
								break;
							}
						}
					}
					if(!clickUnit){
						for(var i=0;i<obj.linePoints.length;i++){
							let point = obj.linePoints[i];
							if(isOnTheLinePoint(absolutePosition.x,absolutePosition.y,point)){
								clickUnit=true;
								break;
							}
						}
					}
					if(!clickUnit){
						for(var i=0;i<obj.walls.length;i++){
							let wall = obj.walls[i];
							if(isOnTheWall(absolutePosition.x,absolutePosition.y,wall)){//单击到了墙上 ：添加点
								let points=wall.points;
								
								//墙中心线被点击位置：
								let args = getTriangleFormatArgs(absolutePosition.x,absolutePosition.y,wall);
								let a=args.a,
									c=args.c;
								let h=args.s*2/c;
								let d=Math.sqrt(Math.pow(a,2)-Math.pow(h,2));
								
								let x=points[0].positionByPx.x+(points[1].positionByPx.x-points[0].positionByPx.x)*d/c,
									y=points[0].positionByPx.y+(points[1].positionByPx.y-points[0].positionByPx.y)*d/c;
								
								//新建点：
								createVectorPointOnTheWall(x,y,c,d,wall);
								clickUnit=true;
								break;
							}
						}
					}	
					break;
				}
				case 3:{
					//添加物件
					obj.cteateArticle(absolutePosition.x,absolutePosition.y);
					break;
				}
			}
		}
		if(e.button==2){
			switch(obj.operation){
				case 0:{
					let deleted =false;
					//删除墙体端点
					if(!deleted){
						for(var i=0;i<obj.vectorPoints.length;i++){
							let point = obj.vectorPoints[i];
							if(isOnTheVectorPoint(absolutePosition.x,absolutePosition.y,point)){
								deletePoint(point);
								deleted=true;
								break;
							}
						}
					}
					//删除墙面点
					if(!deleted){
						for(var i=0;i<obj.linePoints.length;i++){
							let point=obj.linePoints[i];
							if(isOnTheLinePoint(absolutePosition.x,absolutePosition.y,point)){
								deletePoint(point);
								deleted=true;
								break;
							}
						}
					}
					//删除物件
					if(!deleted){
						for(var i=0;i<obj.articles.length;i++){
							let article=obj.articles[i];
							if(isOnTheArticle(absolutePosition.x,absolutePosition.y,article)){
								obj.articles.splice(i,1);
								deleted=true;
								break;
							}
						}
					}
					//删除墙
					if(!deleted){
						for(var i=0;i<obj.walls.length;i++){
							let wall=obj.walls[i];
							if(isOnTheWall(absolutePosition.x,absolutePosition.y,wall)){
								deleteWall(wall);
								deleted=true;
								break;
							}
						}
					}
					break;
				}
			}
		}
	}
	
	function initArticle(){
		if(arguments.length==2){
			let obj=arguments[0],
				spec=arguments[1];
			obj.operation=3;
			obj.articleSpec=spec;	
		}else{
			if(!arguments[0]){
				obj.operation=0;
				obj.articleSpec=undefined;
			}
		}
	}
	
	//墙体
	function Wall(point0,point1,obj){
		var that=this;
		this.jamObj=obj;
		this.points=[
			point0,
			point1
		];
		this.width = obj.wallWidth*obj.scaleGap;
		this.uuid=guid();
		this.getLength=function(){
			return getWallLength(that)/obj.scaleGap;
		}
		this.getRotationY=function(){
			return getAngle(
				that.points[0].positionByPx.x,
				that.points[0].positionByPx.y,
				that.points[1].positionByPx.x,
				that.points[1].positionByPx.y
			);
		}
		this.getPosition=function(){
			return {
				x:(that.points[0].position.x+that.points[1].position.x)/2,
				y:(that.points[0].position.y+that.points[1].position.y)/2
			};
		}
		this.getWidth=function(){
			return that.width/obj.scaleGap;
		}
	}
	
	//物件
	function Article(){
		var that = this;
		this.spec={};
		let spec;
		this.uuid=guid();
		if(arguments.length==4){//x,y,obj,spec ------>onFloor
			let x=arguments[0],
				y=arguments[1],
				obj=arguments[2];
			spec=arguments[3];
			
			for(var name in spec){
				that.spec[name]=spec[name];
			}
			
			this.width=this.spec.width*obj.scaleGap;
			this.height=this.spec.height*obj.scaleGap;
			this.positionByPx={
				x:x,
				y:y,
			}
			this.rotation={
				y:0
			}
			this.jamObj=obj;
		}
		if(arguments.length==3){//wall,ratio,spec
			let wall=arguments[0],
				obj=wall.jamObj,
				ratio=arguments[1];
			spec=arguments[2];
			for(var name in spec){
				that.spec[name]=spec[name];
			}
			this.wall=wall;
			this.width=this.spec.width*obj.scaleGap;
			if(this.spec.height){
				this.height=this.spec.height*obj.scaleGap;
			}else{
				this.height=this.wall.width;
			}
			this.jamObj=wall.jamObj;
			this.ratio=ratio;
			this.direction=1;//or-1
			this.positionByPx={
				x:0,
				y:0
			}
			this.rotation={
				y:0
			}
			this.updatePosition=function(){
				let point0=that.wall.points[0],
					point1=that.wall.points[1];
				that.positionByPx.x=point0.positionByPx.x+(point1.positionByPx.x-point0.positionByPx.x)*that.ratio;
				that.positionByPx.y=point0.positionByPx.y+(point1.positionByPx.y-point0.positionByPx.y)*that.ratio;
				}
			this.updateRotation=function(){
				if(!that.spec.onFloor){
					that.rotation.y=getAngle(that.wall.points[0].positionByPx.x,that.wall.points[0].positionByPx.y,that.wall.points[1].positionByPx.x,that.wall.points[1].positionByPx.y);
				}
			}
			this.updatePosition();
			this.updateRotation();
		}
		if(this.spec.type)this.name=this.spec.type;
		if(this.spec.name)this.name=this.spec.name;
		this.title=(this.spec.title)?this.spec.title:"";
	}
	
	//围墙 
	function AroundWall(aroundId){
		this.aroundId=aroundId;
		this.points=[];
	}
	
	//滑动条
	function Slider(obj,fun,spec){
			var that = this;
			
			this.jamObj=obj;
			this.fun=fun;
			this.minValue=spec.minValue;
			this.maxValue=spec.maxValue;
			if(spec.title){
				this.title=spec.title;
			}
			if(spec.defaultValue){
				this.value=(spec.defaultValue-spec.minValue)/(spec.maxValue-spec.minValue);
				fun(spec.defaultValue);
			}else{
				this.value=spec.minValue+(spec.maxValue-spec.minValue)/2;
			}
			
			this.change=function(y){
				that.value=(y-(obj.canvas.height-obj.slider_length)/2)/obj.slider_length;
				if(that.value>1)that.value=1;
				if(that.value<0)that.value=0;
				fun(that.minValue+(that.maxValue-that.minValue)*that.value);
			}
		}
	
	//可动端点 能够跟随鼠标随意移动
	function VectorPoint(x,y,obj){
		this.jamObj=obj;
		this.positionByPx={
			x:x,
			y:y
		}
		var that=this;
		this.aroundIds=[];
		this.isInTheAround=function(id){
			for(var i=0;i<that.aroundIds.length;i++){
				if(id==that.aroundIds[i]){
					return true;
				}
			}
			return false;
		}
	}
	
	//墙面端点 能够跟随鼠标在所在墙面移动
	function LinePoint(wall,ratio,obj){
		this.jamObj=obj;
		this.wall=wall;
		this.isWallPointN=0;
		this.ratio=ratio;
		this.positionByPx={
			x:wall.points[0].positionByPx.x+(wall.points[1].positionByPx.x-wall.points[0].positionByPx.x)*ratio,
			y:wall.points[0].positionByPx.y+(wall.points[1].positionByPx.y-wall.points[0].positionByPx.y)*ratio
		}
		var that=this;
		this.updatePosition=function(){
			that.positionByPx={
				x:that.wall.points[0].positionByPx.x+(that.wall.points[1].positionByPx.x-that.wall.points[0].positionByPx.x)*that.ratio,
				y:that.wall.points[0].positionByPx.y+(that.wall.points[1].positionByPx.y-that.wall.points[0].positionByPx.y)*that.ratio
			}
		}
		this.aroundIds=[];
	}
	
	//创建用矩形工具
	function WallRect(x,y){
		this.positionByPx={
			x0:x,
			y0:y,
			x1:x,
			y1:y
		}
		var that=this;
		this.initPosition=function(){
			that.positionByPx={
				x0:0,
				y0:0,
				x1:0,
				y1:0
			}
		}
		this.active=false;
	}
	//创建用直线工具
	function WallLine(x,y){
		this.positionByPx={
			x0:x,
			y0:y,
			x1:x,
			y1:y
		}
		var that=this;
		this.initPosition=function(){
			that.positionByPx={
				x0:0,
				y0:0,
				x1:0,
				y1:0
			}
		}
		this.active=false;
	}
	
	function cteateArticle(x,y){
		let obj=this;
		if(obj.articleSpec.onFloor){
			//地面物件
			let article = new Article(x,y,obj,obj.articleSpec);
			obj.articles.push(article);
			obj.operation=0;
		}else{
			for(var i=0;i<obj.walls.length;i++){
				if(isOnTheWall(x,y,obj.walls[i])){
					createArticleOnWall(x,y,obj.walls[i]);
					obj.operation=0;
					break;
				}
			}
		}
	}
	
	function createArticleOnWall(x,y,wall){
		let args = getTriangleFormatArgs(x,y,wall);
		let a=args.a,
			c=args.c,
			h=args.s*2/c,
			d=Math.sqrt(Math.pow(a,2)-Math.pow(h,2)),
			ratio = d/c;
		let article = new Article(wall,ratio,wall.jamObj.articleSpec);
		wall.jamObj.articles.push(article);
	}
	
	function createWall(type,obj){
		switch(type){
			case 1:{
				let wallRect=arguments[2];
				let x0=wallRect.positionByPx.x0,
					y0=wallRect.positionByPx.y0,
					x1=wallRect.positionByPx.x1,
					y1=wallRect.positionByPx.y1;
				let _points=[
					new VectorPoint(x0,y0,obj),
					new VectorPoint(x1,y0,obj),
					new VectorPoint(x1,y1,obj),
					new VectorPoint(x0,y1,obj)
				];
				aroundPoints(obj,_points);
				let _walls=[
					new Wall(_points[0],_points[1],obj),
					new Wall(_points[1],_points[2],obj),
					new Wall(_points[2],_points[3],obj),
					new Wall(_points[3],_points[0],obj)
				]
				pushArray(obj.vectorPoints,_points);
				pushArray(obj.walls,_walls);
				break;
			}
			case 2:{
				let wallLine = arguments[2];
				let x0=wallLine.positionByPx.x0,
					y0=wallLine.positionByPx.y0,
					x1=wallLine.positionByPx.x1,
					y1=wallLine.positionByPx.y1;
				let point0,point1;
				//point0
				switch(obj.point0_type){
					case 1:{
						point0=new VectorPoint(x0,y0,obj);
						obj.vectorPoints.push(point0);
						break;
					}
					case 2:{
						point0=obj.createOperationPoint0;
						break;
					}
					case 3:{
						let wallPoints = obj.createOperationWall0.points;
						let l0 = Math.sqrt(Math.pow(wallPoints[0].positionByPx.x-x0,2)+Math.pow(wallPoints[0].positionByPx.y-y0,2)),
							l1 = Math.sqrt(Math.pow(wallPoints[1].positionByPx.x-wallPoints[0].positionByPx.x,2)+Math.pow(wallPoints[1].positionByPx.y-wallPoints[0].positionByPx.y,2));
						point0=new LinePoint(obj.createOperationWall0,l0/l1,obj);
						point0.isWallPointN++;
						obj.linePoints.push(point0);
						break;
					}
					case 4:{
						point0=obj.createOperationPoint0;
						point0.isWallPointN++;
						break;
					}
				}
				//point1
				switch(obj.point1_type){
					case 1:{
						point1=new VectorPoint(x1,y1,obj);
						obj.vectorPoints.push(point1);
						break;
					}
					case 2:{
						point1=obj.createOperationPoint1;
						break;
					}
					case 3:{
						let wallPoints = obj.createOperationWall1.points;
						let l0 = Math.sqrt(Math.pow(wallPoints[0].positionByPx.x-x1,2)+Math.pow(wallPoints[0].positionByPx.y-y1,2)),
							l1 = Math.sqrt(Math.pow(wallPoints[1].positionByPx.x-wallPoints[0].positionByPx.x,2)+Math.pow(wallPoints[1].positionByPx.y-wallPoints[0].positionByPx.y,2));
						point1=new LinePoint(obj.createOperationWall1,l0/l1,obj);
						point1.isWallPointN++;
						obj.linePoints.push(point1);
						break;
					}
					case 4:{
						point1=obj.createOperationPoint1;
						point1.isWallPointN++;
						break;
					}
				}
				//wall
				let wall = new Wall(point0,point1,obj);
				obj.walls.push(wall);
				break;
			}
		}
	}
	
	//在墙上新建点并分割墙
	function createVectorPointOnTheWall(x,y,c,d,wall){
		let obj=wall.jamObj;
		//新建点
		let point = new VectorPoint(x,y,obj);
		obj.vectorPoints.push(point);
		//为点分配aroundId,并且安排位置
		let aroundIds=ifNearInSameAround(wall.points[0],wall.points[1]);
		if((wall.points[0].aroundIds.length!=0)&&(aroundIds.length!=0)){
			for(var i=0;i<aroundIds.length;i++){
				point.aroundIds.push(aroundIds[i]);
				let aroundWall=getAroundWallByAroundId(obj,aroundIds[i]);
				let matchFirstPointIndex = -1, //用来判断匹配到的第一个点
					matchLastPointIndex = -1;//用来判断匹配到的最后一个点
				for(var j=0;j<wall.points.length;j++){
					for(var k=0;k<aroundWall.points.length;k++){
						if(wall.points[j]==aroundWall.points[k]){
							if(matchFirstPointIndex<0){
								matchFirstPointIndex=k;
							}else{
								matchLastPointIndex=k;
							};
							break;
						}
					}
				}
				if((matchFirstPointIndex==0)&&(matchLastPointIndex==(aroundWall.points.length-1))){
					//首尾相接位置
					aroundWall.points.push(point);
				}else{
					aroundWall.points.splice(matchFirstPointIndex+1,0,point);
				}
				
			}
		}
		//分割墙：
		let wall1=new Wall(point,wall.points[1],obj);
		wall1.width=wall.width;
		wall.points[1]=point;
		obj.walls.push(wall1);//目前还不知道有没有为新墙安排位置的必要
		
		//判断长度 改变linePoint所属和位置
		for(var i=0;i<obj.linePoints.length;i++){
			let linePoint = obj.linePoints[i];
			if(linePoint.wall==wall){
				if(d/c<linePoint.ratio){
					linePoint.wall=wall1;
					linePoint.ratio=(c*linePoint.ratio-d)/(c-d);
				}else{
					linePoint.ratio=c*linePoint.ratio/d;
				}
			}
		}
		//以及墙上Article的位置
		for(var i=0;i<obj.articles.length;i++){
			let article = obj.articles[i];
			if(article.wall==wall){
				if(d/c<article.ratio){
					article.wall=wall1;
					article.ratio=(c*article.ratio-d)/(c-d);
				}else{
					article.ratio=c*article.ratio/d;
				}
			}
		}
	}
	
	//替换点 合并用
	function replace(point0,point1){//将point0的所有关联交给point1,同时删除point0
		let obj=point0.jamObj;
		//将point0的关联墙移交给point1
		let points = [point0,point1];
		for(var i=0;i<obj.walls.length;i++){
			for(var j=0;j<2;j++){
				if(obj.walls[i].points[j]==point0){
					obj.walls[i].points[j]==point1;
				}
			}
		}
		
		let aroundIds = ifInSameArounds(point0,point1);
		if(aroundIds.length!=0){//在同一围墙中
			let nearAroundIds = ifNearInSameAround(point0,point1);
			if(nearAroundIds.length!=0){//挨着，直接合并point0的其他aroundId,无特殊操作
				for(var i=0;i<point0.aroundIds.length;i++){
					if(!ifInArray(point0.aroundIds[i],nearAroundIds)){
						//point0的其他aroundId
						let aroundId =point0.aroundIds[i];
						point1.aroundIds.push(aroundId);
						let aroundWall=getAroundWallByAroundId(obj,aroundId);
						for(var j=0;k<aroundWall.points.length;j++){
							if(point0==aroundWall.points[j]){
								//替换
								aroundWall.points.splice(j,1,point1);
							}
						}
					}
				}
			}else{
				for(var i=0;i<aroundIds.length;i++){
					let aroundWall=getAroundWallByAroundId(obj,aroundIds[i]);
					let pointIndex = ifApartOnePoint(point0,point1,aroundWall);
					if(pointIndex!=-1){
						//相隔一点 从aroundWall.points中删除改点
						removePointInAroundWall(aroundWall.points[pointIndex],aroundWall);
					}else{
						//相隔两点以上 拆分区域
						
					}
				}
			}
		}
		//删除点
		deletePoint(point0);
	}
	
	//删除
	function deleteUnit(obj){
		for(var i=0;i<obj.walls.length;i++){
			if(obj.walls[i].willDelete){
				obj.walls.splice(i,1);
				i--;
			};
		}
		for(var i=0;i<obj.vectorPoints.length;i++){
			if(obj.vectorPoints[i].willDelete){
				for(var j=0;j<obj.aroundWalls.length;j++){//从围墙点数组中删除
					if(obj.vectorPoints[i].isInTheAround(obj.aroundWalls[j].aroundId)){
						for(var k=0;k<obj.aroundWalls[j].points.length;k++){
							if(obj.vectorPoints[i]==obj.aroundWalls[j].points[k]){
								obj.aroundWalls[j].points.splice(k,1);
								break;
							}
						}
					}
				}
				obj.vectorPoints.splice(i,1);
				i--;
			};
		}
		for(var i=0;i<obj.linePoints.length;i++){
			if(obj.linePoints[i].willDelete){
				obj.linePoints.splice(i,1);
				i--;
			};
		}
		for(var i=0;i<obj.articles.length;i++){
			if(obj.articles[i].willDelete){
				obj.articles.splice(i,1);
				i--;
			}
		}
	}
	
	//删除点
	function deletePoint(point){
		let obj=point.jamObj;
		//如果是围墙的最后三个点则从aroundWalls中移除
		if(point.aroundIds.length!=0){
			for(var k=0;k<point.aroundIds.length;k++){
				let aroundId = point.aroundIds[k];
				let count =0;
				for(var i=0;i<obj.vectorPoints.length;i++){
					if(obj.vectorPoints[i].isInTheAround(aroundId))count++;
				}
				if(count<=3){
					for(var i=0;i<obj.vectorPoints.length;i++){//从point.aroundIds中删除aroundId
						if(obj.vectorPoints[i].isInTheAround(aroundId)){
							for(var j=0;j<obj.vectorPoints[i].aroundIds.length;j++){
								if(obj.vectorPoints[i].aroundIds[j]==aroundId){
									obj.vectorPoints[i].aroundIds.splice(j,1);
								}
							}
						};
					}
					for(var i=0;i<obj.aroundWalls.length;i++){//从aroundWalls中移除围墙
						if(aroundId==obj.aroundWalls[i].aroundId){
							obj.aroundWalls.splice(i,1);
							break;
						}
					}
				}
			}
			
		}
		//标记所有相关点线并删除
		markDeletePoint(point);
		deleteUnit(obj);
	}
	
	//删除墙
	function deleteWall(wall){
		markDeleteWall(wall);
		deleteUnit(wall.jamObj);
	}
	
	//根据点标记所有需要删除的point以及wall
	function markDeletePoint(point){
		let obj=point.jamObj;
		point.willDelete=true;
		//做标记 统一删除 顺序删除可能会在递归时出错
		for(var i=0;i<obj.walls.length;i++){
			let wall=obj.walls[i];
			if((wall.points[0]==point||wall.points[1]==point)&&(!wall.willDelete)){
				markDeleteWall(wall);
			}
		}
	}	
	function markDeleteWall(wall){
		let obj=wall.jamObj;
		wall.willDelete=true;
		for(var i=0;i<obj.linePoints.length;i++){
			let linePoint = obj.linePoints[i];
			if((!linePoint.willDelete)&&(linePoint.wall==wall)){
				markDeletePoint(linePoint);
			}
		}
		for(var i=0;i<wall.points.length;i++){
			if((wall.points[i] instanceof LinePoint)&&(!wall.points[i].willDelete)){
				let linePoint = wall.points[i];
				linePoint.isWallPointN--;
				if(linePoint.isWallPointN<=0){
					markDeletePoint(linePoint);
				}
			}
		}
		for(var i=0;i<obj.articles.length;i++){
			let article = obj.articles[i];
			if(!article.spec.onFloor&&(article.wall==wall)){
				article.willDelete=true;
			}
		}
	}
	
	//pushArray
	function pushArray(array0,array1){
		for(var i=0;i<array1.length;i++){
			array0.push(array1[i]);
		}
	}
	
	//把点从围墙中移除
	function removePointInAroundWall(point,aroundWall){
		let obj=point.jamObj;
		let points=aroundWall.points;
		for(var i=0;i<points.length;i++){
			if(point==points[i]){
				points.splice(i,1);
				for(var j=0;j<point.aroundIds.length;j++){
					if(point.aroundIds[j]==aroundWall.aroundId){
						point.aroundIds.splice(j,1);
					}
					break;
				}
				break;
			}
		}
	}
	
	//ifInArray
	function ifInArray(_unit,_array){
		for(var i=0;i<_array.length;i++){
			if(_unit==_array[i]){
				return true;
			}
		}
		return false;
	}
	//aroundPoints 为一组点的aroundId赋相同的id值  表示这是一组围墙端点
	function aroundPoints(obj,points){
		let aroundWall=new AroundWall(obj.aroundId)
		for(var i=0;i<points.length;i++){
			aroundWall.points.push(points[i]);
			points[i].aroundIds.push(obj.aroundId);
		}
		obj.aroundWalls.push(aroundWall);
		obj.aroundId++;
	}
	
	//isOnThePoint 判断坐标是否在点上
	function isOnTheVectorPoint(x,y,point){
		let x0=point.positionByPx.x,
			y0=point.positionByPx.y,
			radius=point.jamObj.pointRadius;
		return (Math.pow(x-x0,2)+Math.pow(y-y0,2))<=Math.pow(radius,2);
	}
	function isOnTheLinePoint(x,y,point){
		let x0=point.positionByPx.x,
			y0=point.positionByPx.y,
			radius=(point.jamObj.wallPointRadius)?point.jamObj.wallPointRadius:point.wall.width*point.jamObj.radiusWidthRatio;
		return (Math.pow(x-x0,2)+Math.pow(y-y0,2))<=Math.pow(radius,2);
	}
	
	//isOntheArticle判断是否在物件上
	function isOnTheArticle(x,y,article){
		let l = Math.sqrt(Math.pow(x-article.positionByPx.x,2)+Math.pow(y-article.positionByPx.y,2)),
			mouseAngle = getAngle(article.positionByPx.x,article.positionByPx.y,x,y);
		if(article.spec.direction){
			let x1=article.positionByPx.x+(article.height+article.wall.width)/2*Math.cos(article.rotation.y+Math.PI/2*article.direction),
				y1=article.positionByPx.y+(article.height+article.wall.width)/2*Math.sin(article.rotation.y+Math.PI/2*article.direction);
			l = Math.sqrt(Math.pow(x-x1,2)+Math.pow(y-y1,2));
			mouseAngle = getAngle(x1,y1,x,y);
		}
		let angle = article.rotation.y-mouseAngle;
		let dw=l*Math.cos(angle),
			dh=l*Math.sin(angle);
		
		return (Math.pow(dw,2)<=Math.pow(article.width/2,2))&&(Math.pow(dh,2)<=Math.pow(article.height/2,2));
	}
	
	
	//isOnTheWall 判断坐标是否在墙上
	function isOnTheWall(x,y,wall){
		let args = getTriangleFormatArgs(x,y,wall);
		
		let a = args.a,
			b = args.b,
			c = args.c;
		let s = args.s;
		let h = s*2/c;//点到墙端点连线距离
			/*
			 * 判断两个锐角&&h<wallWidth/2
			 */
		return (Math.pow(a,2)+Math.pow(c,2)>=Math.pow(b,2))&&(Math.pow(b,2)+Math.pow(c,2)>=Math.pow(a,2))&&(h<=wall.width/2);
	}
	//判断两点在同一围墙
	function ifInSameArounds(point0,point1){
		let aroundIds = [];
		for(var i=0;i<point0.aroundIds.length;i++){
			for(var j=0;j<point1.aroundIds.length;j++){
				if(point0.aroundIds[i]==point1.aroundIds[j]){
					aroundIds.push(point0.aroundIds[i]);
				}
			}
		}
		return aroundIds;
	}
	//判断两点在同一围墙还挨着
	function ifNearInSameAround(point0,point1){
		let aroundIds = [],
			nearInTheAroundIds = [];
		
		let obj=point0.jamObj;
		for(var i=0;i<point0.aroundIds.length;i++){
			for(var j=0;j<point1.aroundIds.length;j++){
				if(point0.aroundIds[i]==point1.aroundIds[j]){
					aroundIds.push(point0.aroundIds[i]);
				}
			}
		}
		for(var i=0;i<aroundIds.length;i++){
			for(var j=0;j<obj.aroundWalls.length;j++){
				if(aroundIds[i]==obj.aroundWalls[j].aroundId){
					let points=obj.aroundWalls[j].points;
					let index0,index1;
					for(var k=0;k<points.length;k++){
						if(points[k]==point0||points[k]==point1){
							if(index0==undefined){
								index0=k;
							}else{
								index1=k;
								break;
							}
						}
					}
					//判断是否挨着
					if((Math.pow(index0-index1,2)==1)||((index0==0)&&(index1==points.length-1))){
						nearInTheAroundIds.push(obj.aroundWalls[j].aroundId);
					}
					break;
				}
			}
		}
		return nearInTheAroundIds;
	}
	
	//是否只相隔一个点
	function ifApartOnePoint(point0,point1,aroundWall){
		let index0,index1;
		for(var i=0;i<aroundWall.points.length;i++){
			if(aroundWall.points[i]==point0||aroundWall.points[i]==point1){
				if(index0==undefined){
					index0=i;
				}else{
					index1=i;
					break;
				}
			}
		}
		let count = index1-index0;
		if(count==2){
			return index0+1;
		}
		if(count==aroundWall.points.length-2){
			if(index0==0){
				return aroundWall.length-1;
			}else{
				return 0;
			}
		}
		return -1;
	}
	
	//是否在按钮上
	function isOnTheBtn(x,y,index,obj){
		let width=obj.menus[obj.menuId][index].width,
			height=obj.menus[obj.menuId][index].height,
			marginRight=obj.btn_marginRigth,
			gap=obj.btn_gap,
			count=obj.menus[obj.menuId].length,
			canvas=obj.canvas;
		
		let x0=canvas.width-(width+marginRight),
			x1=canvas.width-(width+marginRight)+width,
			y0=canvas.height/2+(index-count/2)*(height+gap)+0.5*gap,
			y1=canvas.height/2+(index-count/2)*(height+gap)+0.5*gap+height;
		
		return ((x>=x0)&&(x<=x1)&&(y>=y0)&&(y<=y1));
	}
	
	//是否在滑动条上
	function isOnTheSlider(x,y,index,obj){
		let slider=obj.sliders[index],
			x0=obj.canvas.width-obj.btn_marginRigth-obj.btn_width-(index+1)*(obj.slider_gap+obj.slider_width),
			y0=(obj.canvas.height-obj.slider_length)/2;
		return (x>=x0)&&(x<=x0+obj.slider_width)&&(y>=y0-obj.slider_width/2)&&(y<=y0+obj.slider_length+obj.slider_width/2);
	}
	
	//返回围墙
	function getAroundWallByAroundId(obj,id){
		for(var i=0;i<obj.aroundWalls.length;i++){
			if(id==obj.aroundWalls[i].aroundId){
				return obj.aroundWalls[i];
			}
		}
		return null;
	}
	
	//返回wallWidtn
	function getWallLength(wall){
		let point0=wall.points[0],
			point1=wall.points[1];
		return Math.sqrt(Math.pow(point0.positionByPx.x-point1.positionByPx.x,2)+Math.pow(point0.positionByPx.y-point1.positionByPx.y,2));
	}
	
	function getCanvasPosition({x,y},obj){
		return {
			x:(x-obj.canvasPosition.x)/obj.canvasRatio,
			y:(y-obj.canvasPosition.y)/obj.canvasRatio
		}
	};
	function getAbsolutePosition({x,y},obj){
		return {
			x:x*obj.canvasRatio+obj.canvasPosition.x,
			y:y*obj.canvasRatio+obj.canvasPosition.y
		}
	};
	
	//返回point0至point1的rotation.y
	function getAngle(x0,y0,x1,y1){
		let dx=x1-x0,
			dy=y1-y0,
			l=Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
		if(((dx>0)&&(dy>=0))||((dx>=0)&&(dy<0))){
			return Math.asin(dy/l);
		};
		if(((dx<=0)&&(dy>0))||((dx<0)&&(dy<=0))){
			return Math.PI-Math.asin(dy/l);
		};
	}
	//返回uuid
	function guid() {
	    function S4() {
	       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	    }
	    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}
	//海伦公式 返回边长和面积
	function getTriangleFormatArgs(x,y,wall){
		let point0 = wall.points[0],
			point1 = wall.points[1];
		let a = Math.sqrt(Math.pow(point0.positionByPx.x-x,2)+Math.pow(point0.positionByPx.y-y,2)),
			b = Math.sqrt(Math.pow(point1.positionByPx.x-x,2)+Math.pow(point1.positionByPx.y-y,2)),
			c = Math.sqrt(Math.pow(point0.positionByPx.x-point1.positionByPx.x,2)+Math.pow(point0.positionByPx.y-point1.positionByPx.y,2));
		let p = (a+b+c)/2;
		let s = Math.sqrt(p*(p-a)*(p-b)*(p-c));//三点面积
		
		return{
			a:a,
			b:b,
			c:c,
			s:s
		}
	}
}
jamWall_load_init();

/*
 * require
 */
try{
	define(function(){
		return JamWall;
	})
}catch(e){
	console.log("JamWall：非require方式加载.");
}

