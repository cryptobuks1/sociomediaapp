import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PostProvider } from '../../providers/post/post';
import { ToastController, App } from 'ionic-angular';
import { MenuController } from 'ionic-angular';
import { AuthenticationProvider } from '../../providers/authentication/authentication';
import { PagesEditprofilePage } from '../pages-editprofile/pages-editprofile';
import { MyApp } from '../../app/app.component';
// import * as jwt_decode from 'jwt-decode';

@IonicPage()
@Component({
  selector: 'page-pages-viewprofile',
  templateUrl: 'pages-viewprofile.html',
})
export class PagesViewprofilePage {

  public post: any;
  public comments: any = [];
  public dispcomment: any = '';
  public comment;
  public errcomment: any = '';
  public user;
  public dateOfBirth;
  public likecount: any = [];
  public username: any = '';
  public allikes;
  public gender;
  public likes: any = '';
  public userid: any = '';
  public liketoggle = [];
  public thispost: any = '';
  public proimage;
  public all_users;
  public showcommenttoggle1: any = [];
  constructor(public navCtrl: NavController, public app: App, public auth: AuthenticationProvider, private menu: MenuController, public toastController: ToastController, public navParams: NavParams, public postserv: PostProvider) {
    // const jwt = JSON.parse(localStorage.getItem('currentUser'));
    // const jwtData = jwt_decode(jwt);
    this.user = JSON.parse(localStorage.getItem('currentUser'));;
  }
  menutoggle() {
    this.menu.enable(false, 'home');
    this.menu.enable(false, 'addpost');
    this.menu.enable(true, 'myprofile');
    this.menu.toggle('myprofile');
  }
  ngOnInit() {
    for (const i of this.user) {
      this.username = i.username;
      this.userid = i._id;
    }
      this.getmypost(this.userid);
      this.getcomment();
      this.alllikes(this.userid);
      this.allusers();
  }
  allusers(){
    this.postserv.allusers().subscribe(data=>{
  this.all_users=data;
  for(const all_user of this.all_users){
    if(all_user._id==this.userid){
      this.proimage=all_user.profileimage;
      this.dateOfBirth=all_user.dob;
      this.gender=all_user.gender;
    }
  }
    });
  }
  ionViewWillEnter() {
    this.getmypost(this.userid);
    this.getcomment();
    this.alllikes(this.userid);
    this.allusers();
  }
  addlikes(j, uid, pid) {
    this.postserv.getthispost(pid).subscribe(data => {
      this.thispost = data;
      for (const p of this.thispost) {
        this.likecount[pid] = p.likes;
      }
      this.liketoggle[pid] = !this.liketoggle[pid];
      if (this.liketoggle[pid]) {
        this.likecount[pid] = this.likecount[pid] + 1;
        let body = {
          _id: pid,
          likes: this.likecount[pid]
        };
        this.postserv.updatepost(body).subscribe(data => { this.getmypost(this.userid); });
        let body1 = {
          userid: uid,
          username: this.username,
          postid: pid,
          status: true
        };
        this.postserv.postlikes(body1).subscribe(data1 => { });
      }
      else {
        if (this.likecount[pid] > 0) {
          this.likecount[pid] = this.likecount[pid] - 1;
          let body = {
            _id: pid,
            userid: this.userid,
            likes: this.likecount[pid]
          };
          this.postserv.updatepost(body).subscribe(data => { this.getmypost(this.userid); });
          this.postserv.deletelikes(body).subscribe(data1 => { });
        }
      }
    });
  }
  getmypost(userid) {
    this.postserv.getmypost(userid).subscribe(data => {
      this.post = data;
    });
  }
  getcomment() {
    this.postserv.getcomment().subscribe(data => {
      if (data) {
        this.dispcomment = data;
      }
    });
  }
  addcomment(id, userid, j, username) {
    this.postserv.addcomment(userid, id, username, this.comments[j]).subscribe(data => {
      this.getcomment();
      this.presentToast('Comment Added Successfully!!');
    });
    this.comments[j] = '';
  }
  // gotoprofile(id){
  //   this.route.navigateByUrl('/viewprofile/'+id);

  // }
  deletepost(id) {
    this.postserv.deletepost(id).subscribe(data => {
      this.getmypost(this.userid);
      this.deletePostComment(id);
      this.deletePostlike(id);
      this.presentToast('Post deleted successfully!!..');
    });
  }
  deletePostlike(id){
    this.postserv.deletepostlike(id).subscribe();
  }
  deletePostComment(id){
    this.postserv.deletepostcomment(id).subscribe();
  }
  alllikes(uid) {
    this.postserv.getlikes(uid).subscribe(data => {
    this.allikes = data;
      for (let l of this.allikes) {
        this.liketoggle[l.postid] = l.status;
      }
    });
  }
  deletecomment(id) {
    this.postserv.deletecomment(id).subscribe(data => {
      this.getcomment();
      this.presentToast('Comment deleted successfully!!..')
    });
  }
  showcommenttoggle(j) {
    this.showcommenttoggle1[j] = !this.showcommenttoggle1[j];
  }
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }
  logout() {
    this.auth.logout();
    this.app.getRootNav().setRoot(MyApp);
  }
  gotoeditprofile() {
    this.navCtrl.push(PagesEditprofilePage);
  }
}
