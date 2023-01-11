document.write('<script src=js/roslib.js></script>');
document.write('<script src=js/easel_min.js></script>');
document.write('<script src=js/eventemitter2_min.js></script>');
document.write('<script src=js/ros2d.js></script>');
document.write('<script src=js/nipple.js></script>');
document.write('<script src=js/mjpegcanvas.min.js></script>');
document.write('<script src="js/jquery.js"></script>');
var current_poseX;
var current_poseY;
var hostname;
var mode;
var check_mode=0;
var NavMap;
var side_click;
var cmdVel;
var ros = new ROSLIB.Ros();
var chatter=new ROSLIB.Topic({ros:ros,name:'/chatter',messageType:'std_msgs'});
var mode_msgs = new ROSLIB.Message({data:''});
var chatter2=new ROSLIB.Topic({ros:ros,name:'/chatter2',messageType:'std_msgs'});
var mode_msgs2 = new ROSLIB.Message({data:''});
var nav_status=document.getElementById('nav_status');

//navigation status
var MoveBaseStatusTopic = new ROSLIB.Topic({
  ros:ros,
  name:'/move_base/status',
  messageType:'actionlib_msgs/GoalStatusArray'
});

function openNav() {
    document.getElementById("mySidenav").style.width = "300px";
    document.getElementById("current_date").style.position="fixed";
    document.getElementById("current_date").style.left="10px";
    document.getElementById("current_date").style.bottom="0";
    document.getElementById("current_date").style.display="";
    
    
  }
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("current_date").style.display="none";
  }
function change(){
  if(document.getElementById('map').style.display!="none"){
    document.getElementById("map").style.display="none";//隐藏
    document.getElementById('camara').style.display="";

  }
  else{
    document.getElementById("map").style.display="";//顯示
    document.getElementById('camara').style.display="none";
  }
}
function init(){
  current_time();
  createJoystick();
  slide_scale()
}
function current_time(){
  //time display
    Today = new Date();
    yy=Today.getFullYear();
    mm=Today.getMonth()+1;
    dd=Today.getDate();
    h=Today.getHours();
    m=Today.getMinutes();
    s=Today.getSeconds();
    var time=yy+"/"+mm+"/"+dd+"=>"+ h+":"+m+":"+s;
    console.log(time);
    document.getElementById("mT").innerHTML=time;
    setTimeout('current_time()',1000);
  }
//========================================
//                滑桿
//========================================
createJoystick = function () {
  var options = {
    zone: document.getElementById('zone_joystick'),
    threshold: 0.1,
    position: { left: 45 + '%' ,top:100+'px'},
    mode: 'static',
    size: 120,
    color: '#000000',
  };
  manager = nipplejs.create(options);

  linear_speed = 0;
  angular_speed = 0;

  self.manager.on('start', function (event, nipple) {
    console.log("Movement start");
    
  });

  self.manager.on('move', function (event, nipple) {
    console.log("Moving");
      max_linear = document.getElementById('linear_velocity').value*0.01; // m/s
      max_angular = document.getElementById('angular_velocity').value*0.01; // rad/s
      max_distance = 75.0; // pixels;
      linear_speed = Math.sin(nipple.angle.radian) * max_linear * nipple.distance/max_distance;
      angular_speed = -Math.cos(nipple.angle.radian) * max_angular * nipple.distance/max_distance;
      if(nipple.angle.radian>=0&&nipple.angle.radian<=3){
        angular_speed = -Math.cos(nipple.angle.radian) * max_angular * nipple.distance/max_distance;
      }
      else{
        angular_speed = Math.cos(nipple.angle.radian) * max_angular * nipple.distance/max_distance;
      }
      move(linear_speed,angular_speed);
  });
  self.manager.on('end', function () {
    move(0,0);
    console.log("Movement end");
  });
}

//========================================
//                初始位置設定
//========================================
var initpose = new ROSLIB.Topic({
  ros:ros,
  name:'/initialpose',
  messageType:'geometry_msgs/PoseWithCovarianceStamped'
});
init_pose=function(){
var initial_pose = new ROSLIB.Message({
  header: {
    frame_id: "map"},
  pose:{
    pose: {
      position: {x: 0, y: 0, z: 0.0},
      orientation: {x: 0.0, y: 0.0, z: 0.0, w: 1.0}}
  } 
  });
  var initposex;
  var initposey;
  initposex = document.getElementById('initposex').value;
  initposey = document.getElementById('initposey').value;
  initial_pose.pose.pose.position.x=parseFloat(initposex);
  initial_pose.pose.pose.position.y=parseFloat(initposey);
  initpose.publish(initial_pose);
  console.log(initial_pose);
}

//========================================
//                模式選擇
//========================================

function mode_check_1(){
  document.getElementById('select_gmapping').style.color="rgb(15, 16, 16)";
  document.getElementById('select_gmapping').style.backgroundColor="rgb(147, 233, 153)";
  document.getElementById('select_navigation').style.color="rgb(13, 13, 14)";
  document.getElementById('select_navigation').style.backgroundColor="rgb(236, 243, 237)";
  document.getElementById('map_select').style.display="none";
  document.getElementById('mapsave').style.display="";
  if(side_click==2){
    document.getElementById('contant1').style.display="none";
  }
    if(check_mode==0){
      mode_msgs.data='roslaunch turtlebot3_slam turtlebot3_slam.launch slam_methods:=gmapping';  
      chatter.publish(mode_msgs);
      console.log(mode_msgs);
      check_mode=1;
    }
    else if(check_mode==1){
      alert('The mode is already gmapping，please onclick another!!');
    }
    else if(check_mode==2){
      setTimeout(function(){mode_msgs.data='roslaunch turtlebot3_slam turtlebot3_slam.launch slam_methods:=gmapping';
      chatter.publish(mode_msgs);
      console.log(mode_msgs);},500);
      setTimeout(function(){mode_msgs2.data='pkill rviz';chatter2.publish(mode_msgs2);console.log(mode_msgs2);},3000);
      check_mode=1;
    }
    
    
  
}
function mode_check_2(){
  document.getElementById('select_gmapping').style.color="rgb(13, 13, 14)";
  document.getElementById('select_gmapping').style.backgroundColor="rgb(236, 243, 237)";
  document.getElementById('select_navigation').style.color="rgb(15, 16, 16)";
  document.getElementById('select_navigation').style.backgroundColor="rgb(147, 233, 153)";
  document.getElementById('map_select').style.display="";
  document.getElementById('mapsave').style.display="none";
  document.querySelector('#map_select').onchange=function map_select(){
  alert('map is change')
  NavMap=document.querySelector('#map_select').value;
    if(NavMap==='null'){
      alert('please select a map ');
    }
    else{
      if(side_click==2){
        document.getElementById('contant1').style.display="";
        
      }
      if(check_mode==0){
        console.log('navigation the first onclick');
        mode_msgs.data='roslaunch turtlebot3_navigation turtlebot3_navigation.launch map_file:=$HOME/'+NavMap+'.yaml'; 
        chatter.publish(mode_msgs);
        console.log(mode_msgs);
        check_mode=2; 
        nav_status.innerHTML = message.status_list[0].text; 
         
      }
      else if(check_mode==1){
        setTimeout(function(){mode_msgs.data='roslaunch turtlebot3_navigation turtlebot3_navigation.launch map_file:=$HOME/'+NavMap+'.yaml';
        chatter.publish(mode_msgs);
        console.log(mode_msgs);},500);
        setTimeout(function(){mode_msgs2.data='pkill rviz';chatter2.publish(mode_msgs2);console.log(mode_msgs2);},3000);
        var nav_status=document.getElementById('nav_status');
        nav_status.innerHTML = message.status_list[0].text;
        check_mode=2;
      }
      else if(check_mode==2){
        alert('The mode is already navigation，please onclick another!!');
      }     
     }
    }
    
    
}

function home(){
  side_click=1;
  document.getElementById('wel').style.display="";//顯示首頁
  document.getElementById('Gmapping').style.display="none";//將其他的隱藏起來
  document.getElementById('home_sd').style.backgroundColor="";
  document.getElementById('map_sd').style.backgroundColor="#8bd3e6";
  document.getElementById('message_sd').style.backgroundColor="#8bd3e6";
  document.getElementById('setting_sd').style.backgroundColor="#8bd3e6"; 
}
function map(){
  side_click=2;
  document.getElementById('home_sd').style.backgroundColor="#8bd3e6";
  document.getElementById('map_sd').style.backgroundColor="";
  document.getElementById('message_sd').style.backgroundColor="#8bd3e6";
  document.getElementById('setting_sd').style.backgroundColor="#8bd3e6";
  if(mode=='gmapping'){
    document.getElementById('wel').style.display="none";
    document.getElementById('Gmapping').style.display="";
    document.getElementById('contant1').style.display="none";
    document.getElementById('contant2').style.display="";
    document.getElementById('contant3').style.display="none";
    document.getElementById('contant4').style.display="none";

  }
  else{
    
    document.getElementById('wel').style.display="none";
    document.getElementById('Gmapping').style.display="";
    document.getElementById('contant1').style.display="";
    document.getElementById('contant2').style.display="";
    document.getElementById('contant3').style.display="none";
    document.getElementById('contant4').style.display="none";
    document.getElementById('zone_joystick').style.display="";
  }
}
function message(){
  document.getElementById('wel').style.display="none";
  document.getElementById('Gmapping').style.display="";
  document.getElementById('contant1').style.display="none";
  document.getElementById('contant2').style.display="none";
  document.getElementById('contant3').style.display="";
  document.getElementById('contant4').style.display="none";
  document.getElementById('zone_joystick').style.display="none";  
  document.getElementById('home_sd').style.backgroundColor="#8bd3e6";
  document.getElementById('map_sd').style.backgroundColor="#8bd3e6";
  document.getElementById('message_sd').style.backgroundColor="";
  document.getElementById('setting_sd').style.backgroundColor="#8bd3e6";
}
function setting(){
  document.getElementById('wel').style.display="none";
  document.getElementById('Gmapping').style.display="";
  document.getElementById('contant1').style.display="none";
  document.getElementById('contant2').style.display="none";
  document.getElementById('contant3').style.display="none";
  document.getElementById('contant4').style.display="";
  document.getElementById('zone_joystick').style.display="none";
  document.getElementById('map_sd').style.backgroundColor="#8bd3e6";
  document.getElementById('home_sd').style.backgroundColor="#8bd3e6";
  document.getElementById('message_sd').style.backgroundColor="#8bd3e6";
  document.getElementById('setting_sd').style.backgroundColor="";
   
}
//================================================
//     amcl_pose select
// ===============================================
var amcl = new ROSLIB.Topic({
  ros:ros,
  name:'/amcl_pose',
  messageType:'geometry_msgs/PoseWithCovarianceStamped'
});
amcl.subscribe(function(message){
  var poseX=document.getElementById('poseX');
  poseX.innerHTML=message.pose.pose.position.x;
  current_poseX=message.pose.pose.position.x;
  var poseY=document.getElementById('poseY');
  poseY.innerHTML=message.pose.pose.position.y;
  current_poseY=message.pose.pose.position.y;
  var poseZ=document.getElementById('poseZ');
  poseZ.innerHTML=message.pose.pose.position.z;
  var orientationX=document.getElementById('orientationX');
  orientationX.innerHTML=message.pose.pose.orientation.x;
  var orientationY=document.getElementById('orientationY');
  orientationY.innerHTML=message.pose.pose.orientation.y;
  var orientationZ=document.getElementById('orientationZ');
  orientationZ.innerHTML=message.pose.pose.orientation.z;
  var orientationW=document.getElementById('orientationW');
  orientationW.innerHTML=message.pose.pose.orientation.w;
  //
  var poseX1=document.getElementById('poseX1');
  poseX1.innerHTML=message.pose.pose.position.x;
  current_poseX1=message.pose.pose.position.x;
  var poseY1=document.getElementById('poseY1');
  poseY1.innerHTML=message.pose.pose.position.y;
  current_poseY1=message.pose.pose.position.y;
  var poseZ1=document.getElementById('poseZ1');
  poseZ1.innerHTML=message.pose.pose.position.z;
  var orientationX1=document.getElementById('orientationX1');
  orientationX1.innerHTML=message.pose.pose.orientation.x;
  var orientationY1=document.getElementById('orientationY1');
  orientationY1.innerHTML=message.pose.pose.orientation.y;
  var orientationZ1=document.getElementById('orientationZ1');
  orientationZ1.innerHTML=message.pose.pose.orientation.z;
  var orientationW1=document.getElementById('orientationW1');
  orientationW1.innerHTML=message.pose.pose.orientation.w;
})
$('#select_pose').change(function(){
  if(document.querySelector('#select_pose').value==="position"){
    document.getElementById('position').style.display="";
    document.getElementById('orientation').style.display="none";
  }
  else{
    document.getElementById('position').style.display="none";
    document.getElementById('orientation').style.display="";
  }
});
$('#select_pose1').change(function(){
  if(document.querySelector('#select_pose1').value==="position"){
    document.getElementById('position1').style.display="";
    document.getElementById('orientation1').style.display="none";
  }
  else{
    document.getElementById('position1').style.display="none";
    document.getElementById('orientation1').style.display="";
  }
});
//================================================
//      about ROS        connnect to ros
// ===============================================
function ip_connect(){
    hostname=document.getElementById('hostname').value;
    var RosServer = "ws://"+hostname+":9090";
    console.log(hostname);
    ros.connect(RosServer);
    ros.on('connection', function() {
        console.log('Connected to websocket server.');
        document.getElementById("connecting").innerHTML="connect";
        document.getElementById("connect").innerHTML="connect";
        document.getElementById("connect").style.color="lime";
        document.getElementById("connecting").style.color="#FFFECB";
        document.getElementById("nav").style.backgroundColor="rgb(77, 241, 121)";
        $('#side_ip').attr('src','./imges/connect.png');
    });
    ros.on('error', function(error) {
        console.log('Error connecting to websocket server: ', error);
        document.getElementById("connecting").innerHTML="error";
        document.getElementById("connecting").style.color="#FFFECB";
        document.getElementById("connecting").style.backgroundColor="yellow";
    });    
    ros.on('close', function() {
        console.log('Connection to websocket server closed.');
        document.getElementById("connecting").innerHTML="closed";
        document.getElementById("connect").innerHTML="close";
        document.getElementById("connect").style.color="red";
        document.getElementById("connecting").style.color="#FFFECB";
        document.getElementById("nav").style.backgroundColor ="rgb(241, 77, 77);";
        $('#side_ip').attr('src','./imges/close.png');
        
    }); 
}
function ip_close(){
  location.reload();
}
//========================================
//                cmd_vel control
//========================================
function pub_cmd_vel(val){
  cmdVel = new ROSLIB.Topic({
    ros : ros,
    name : key[val],
    messageType : 'geometry_msgs/Twist'
    });   
}
move=function(linear, angular) {
  var twist = new ROSLIB.Message({
      linear : {
          x : linear,
          y : 0,
          z : 0
      },
      angular : {
          x : 0,
          y : 0,
          z : angular
      }
      });
  cmdVel.publish(twist);
}
function slide_scale(){
  document.getElementById('linear_value').innerHTML=document.getElementById('linear_velocity').value;
  document.getElementById('angular_value').innerHTML=document.getElementById('angular_velocity').value;
  setTimeout('slide_scale()',500);
}
// ========================================
//               ros 更新話題
// ========================================
var key=[];
var value=[];
function getTopics() {
  var topicsClient = new ROSLIB.Service({
  ros : ros,
  name : '/rosapi/topics',
  serviceType : 'rosapi/Topics'
  });
  
  var request = new ROSLIB.ServiceRequest();

  topicsClient.callService(request, function(result) {
  key=result.topics;
  value=result.types;
  var nb=1;
  $('#all_topic').empty();
  $('#Cam_topic').empty();
  $('#vel_topic').empty();
  $('#Cam_topic').append('<option></option>');
  $('#vel_topic').append('<option></option>');
  
  for(var tag=0 ;tag<result.topics.length;tag++){
    $('#all_topic').append('<p>'+nb+':'+key[tag]+','+value[tag]+'</p>');
    if(result.types[tag]==="sensor_msgs/Image"){
      $('#Cam_topic').append('<option value='+tag+'>'+key[tag]+'</option>');
    }
    if(result.types[tag]==="geometry_msgs/Twist"){
      $('#vel_topic').append('<option value='+tag+'>'+key[tag]+'</option>');  
    }
    nb++;
  };
  });
}
function getOption(val){
  $('#cam').attr('src','http://'+hostname+':8080/stream?topic='+key[val]);
}
// ========================================
//               ros map放大縮小
// ========================================
function MapZoom(){
  viewer.scene.scaleX*=1.25;
  viewer.scene.scaleY*=1.25;    
}//地圖放大
function MapPan(){
  viewer.scene.scaleX*=0.75;
  viewer.scene.scaleY*=0.75;    
}//地圖縮小
// ========================================
//               定點導航
// ========================================
var n=0;
function add_new_pose(){
  if(document.getElementById('set_goal').style.display=='none'){
    document.getElementById('set_goal').style.display='';
  }
  n++;
  $('#set_goal').append('<div id=pose'+n+'><p>位置'+n+'：</p><p><span>X:</span><input type="text" id="x'+n+'"style="width: 25px;margin-right: 5px;"><span> Y:</span><input type="text" id="y'+n+'"style="width: 25px;"> <input type="button" id="read_pose'+n+'" value="讀取目前位置" style="margin-left:20px;" onclick="read_pose('+n+')"></p></div>');
  $('#goto').append('<option id="goal'+n+'" value="'+n+'">位置'+n+'</option>');
}
function reduce_new_pose(){
  
  $('#pose'+n).remove();
  $('#goal'+n).remove();
  if(n>0){
    n--;
    if(n==0){
      document.getElementById('set_goal').style.display='none';
    }
  }

  
}
function read_pose(change){
  document.getElementById('x'+change).value=current_poseX;
  document.getElementById('y'+change).value=current_poseY;
}
var move_base_simple_topic = new ROSLIB.Topic({
  ros:ros,
  name:'/move_base_simple/goal',
  message:'geometry_msgs/PoseStamped'
});
var move_base_simple_msgs = new ROSLIB.Message({
  header: {
    frame_id: "map"},
  pose: {
    position: {x: 0.53, y: 0.53, z: 0.0},
    orientation: {x: 0.0, y: 0.0, z: 0.0, w: 1.0}}
  });
var howgo_x;
var howgo_y; 
function go(){
  var value=document.querySelector('#goto').value;
	howgo_x=document.getElementById('x'+value).value;
  howgo_y=document.getElementById('y'+value).value;
  send_simplgoal(howgo_x,howgo_y);

}
send_simplgoal=function(howgo_x,howgo_y){
    
  move_base_simple_msgs.pose.position.x=parseFloat(howgo_x);
  move_base_simple_msgs.pose.position.y=parseFloat(howgo_y);
  console.log(move_base_simple_msgs);
  move_base_simple_topic.publish(move_base_simple_msgs);
}
// ========================================
//               更新點的資料
// ========================================
function read(){
  var read_txt=new ROSLIB.Topic({
    ros:ros,
    name:'/listen1',
    type:'std_msgs/String'
  });
  read_txt.subscribe(function(message){
    
  });
}
// ========================================
//               更新點的資料
// ========================================
function map_save(){
  
  var map_save=new ROSLIB.Topic({
    ros:ros,
    name:'/map_listen',
    type:'std_msgs/String'
  });
  var map_file=new ROSLIB.Message({
    data:""
  });

  alert(document.getElementById('map_file').value);
  map_file.data="rosrun map_server map_saver -f ~/"+document.getElementById('map_file').value;
  map_save.publish(map_file);
}
