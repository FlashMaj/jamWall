jamWall.js  v2.0.0   FlashMaj   qq:1106219402  2018.07.17
刚刚毕业，趁着还有时间翻新了一些项目，这个是重置的jamWall划墙插件，可以用来绘制户型并返回真实坐标。



/*
 *获取：
 */
//数值以m为单位
//数值需要在finish()执行后或在执行jamWall.updateInfo()方法后获取

//墙体端点数组：
jamWall.vectorPoints
//墙上端点数组：
jamWall.linePoints
//物件数组：
jamWall.articles

//墙体对象数组：
jamWall.walls
//室内围墙数组：
jamWall.aroundWalls


//对象可用属性/方法
vectorPoint.position//{x:x,y:y}
linePoint.position
articles.position
articles.spec
articles.rotation.y

wall.points//端点数组
wall.getPosition()
wall.getRotationY()
wall.getLength()//墙长
wall.getWidth()//墙宽

aroundWalls.points//端点数组
aroundWalls.aroundId//围墙唯一id



/*
 *可设置属性/功能：有点多..在js文件中看注释吧...
 */



/*
 *可用方法
 */
jamWall.show();
jamWall.hidden();
jamWall.finish(fun);//完成绘画后执行函数 ， 点击对勾按钮触发
jamWall.updateInfo();//更新实际坐标数据（画布坐标(px)为实时的，实际坐标(m)需要转换，jamWall.finish()会自动此函数）
jamWall.changeRatio(ratio);//改变画布比例，传入值为一单位距离对应米数
jamWall.clean();//清空画布
jamWall.createMenu(menuName);//创建新菜单  0、"0"、"primaryMenu"、1、"1"、"articles"为已占用菜单名
jamWall.toMenu(menuName);//进入菜单
menu.add(button);//为菜单添加按钮
jamWall.turnTheMenuBack();//返回上一级菜单
jamWall.initArticle(spec);//执行添加物件操作
jamWall.changeOperation(operationType);//改变当前操作状态
jamWall.createSlider(  //添加滑动条
	changeFun,//方法，能够传入数值
	{
		minValue:minValue,//最大数值
		maxValue:maxValue,//最小数值
		title:"画布比例"//提示框文字
		defaultValue:1,//默认数值，非必须，不填写为平均值	
});




/*
 *类
 */
JamWall();//jamWall构造器
jamWall.Button(menuName,clickFun,textOrDraw,promptText,promptBoxPositionType);//按钮构造方法
//参数说明：
//menuName必须参数：所在菜单名
//clickFun必须参数：点击后执行函数
//textOrDraw必须函数：传入字符串时按钮显示文字，传入绘制方法时按钮显示图标图形
//promptText可选参数：提示框文字
//promptBoxPositionType可选参数：提示框相对于鼠标的方向的几种预设类型，整数0、1、2、3