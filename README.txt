jamWall.js  v2.0.0   FlashMaj   qq:1106219402  2018.07.17
�ոձ�ҵ�����Ż���ʱ�䷭����һЩ��Ŀ����������õ�jamWall��ǽ����������������ƻ��Ͳ�������ʵ���ꡣ



/*
 *��ȡ��
 */
//��ֵ��mΪ��λ
//��ֵ��Ҫ��finish()ִ�к����ִ��jamWall.updateInfo()�������ȡ

//ǽ��˵����飺
jamWall.vectorPoints
//ǽ�϶˵����飺
jamWall.linePoints
//������飺
jamWall.articles

//ǽ��������飺
jamWall.walls
//����Χǽ���飺
jamWall.aroundWalls


//�����������/����
vectorPoint.position//{x:x,y:y}
linePoint.position
articles.position
articles.spec
articles.rotation.y

wall.points//�˵�����
wall.getPosition()
wall.getRotationY()
wall.getLength()//ǽ��
wall.getWidth()//ǽ��

aroundWalls.points//�˵�����
aroundWalls.aroundId//ΧǽΨһid



/*
 *����������/���ܣ��е��..��js�ļ��п�ע�Ͱ�...
 */



/*
 *���÷���
 */
jamWall.show();
jamWall.hidden();
jamWall.finish(fun);//��ɻ滭��ִ�к��� �� ����Թ���ť����
jamWall.updateInfo();//����ʵ���������ݣ���������(px)Ϊʵʱ�ģ�ʵ������(m)��Ҫת����jamWall.finish()���Զ��˺�����
jamWall.changeRatio(ratio);//�ı仭������������ֵΪһ��λ�����Ӧ����
jamWall.clean();//��ջ���
jamWall.createMenu(menuName);//�����²˵�  0��"0"��"primaryMenu"��1��"1"��"articles"Ϊ��ռ�ò˵���
jamWall.toMenu(menuName);//����˵�
menu.add(button);//Ϊ�˵���Ӱ�ť
jamWall.turnTheMenuBack();//������һ���˵�
jamWall.initArticle(spec);//ִ������������
jamWall.changeOperation(operationType);//�ı䵱ǰ����״̬
jamWall.createSlider(  //��ӻ�����
	changeFun,//�������ܹ�������ֵ
	{
		minValue:minValue,//�����ֵ
		maxValue:maxValue,//��С��ֵ
		title:"��������"//��ʾ������
		defaultValue:1,//Ĭ����ֵ���Ǳ��룬����дΪƽ��ֵ	
});




/*
 *��
 */
JamWall();//jamWall������
jamWall.Button(menuName,clickFun,textOrDraw,promptText,promptBoxPositionType);//��ť���췽��
//����˵����
//menuName������������ڲ˵���
//clickFun��������������ִ�к���
//textOrDraw���뺯���������ַ���ʱ��ť��ʾ���֣�������Ʒ���ʱ��ť��ʾͼ��ͼ��
//promptText��ѡ��������ʾ������
//promptBoxPositionType��ѡ��������ʾ����������ķ���ļ���Ԥ�����ͣ�����0��1��2��3