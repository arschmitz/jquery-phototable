// JavaScript Document
$.widget("ui.phototable",{
		 options:{
			idx:-1,
			idxLarge:-1,
			mouseup:false,
			photoW:184,
			dragW:280,
			stackW:400,
			navPage:0,
			captions:true,
			facebookAlbum:null,
			facebook:true,
			create:function(){},
			shuffle:function(){},
			refresh:function(){},
			stack:function(){},
			disperse:function(){},
			remove:function(){},
			facebookAppId:null,
			facebookChannelUrl:'src/channel.php',
			facebookTags:true
		 },
		 _ie:function(){
			  if($.browser.msie) return true;
			  else return false;
		  },
		 _create:function(){
			 this.element.addClass('phototable');
			 this.options.create();
		 },
		 grid:function(){
			var self = this;
			$('<style type="text/css">.phototable-placeholder{display:inline-block; zoom:1; *display:inline; width:'+self.options.photoW+'px; height:'+self.options.photoW+'px; }</style>').appendTo('head');
			self.gridActive = true;
			self.element.find('.phototable-photo').attr('style','').css({'position':'relative',display:'inline-block',margin:'5px'}).each(function(){
				$(this).draggable('destroy');																													
			});
			self.element.sortable({placeholder:'phototable-placeholder',update:function(e,ui){ self._mouseUp(ui.item);}});
		 },
		 _init:function(){
			 var self = this;
			 $(document).bind('mouseup',function(e){
					self._mouseUp(this);
					e.preventDefault();
				});
			 self.element.on('click','.likeBtn',function(){
				self.facebookLike(this);																					
			 }).on('click','.commentBtn',function(){
				self.facebookComment(this);																					
			  }).on('click','.tagBtn',function(){
				self.facebookTag(this);																					
			  });
			 $('body').append('<a id="phototable-loading" href="#" class="phototable-loading"></a>');
			 $('#phototable-loading').show();
			 this.refresh();
			 $('#phototable-loading').hide();
			 if(self.options.facebook){
				 self._facebookInit();
			 }
			 self.element.css({'z-index':'1000'});
		 },
		 refresh: function(opt){
			 var self = this;
			 if(!this.element.hasClass('phototable')) this.element.addClass('phototable');
			 //var self = this;
			// this.element.find('.phototable-photo').show().width(self.options.photoW).height('').find('img').width(this.options.photoW);
			 //this.shuffle();
			 var photoCount = 0;
			 //this.photosCount = this.element.children('div').length;
			 if(this.film !== true  && this.macActive !== true){
				 this.photosCount = this.element.children('div').length;
			 } else {
				 var currentCount = this.element.find('.phototable-photo').length;
				 var newCount = this.element.children('div').length - 1;
				 //console.log(newCount);
				 this.photosCount = currentCount + newCount;
			 }
			 this.tableW = this.element.width();
			 this.tableH = this.element.height();
			 this.horizontalMax = this.tableW - this.options.photoW;
			 this.verticalMax = this.tableH - this.options.photoW;
			$('<img />').attr('src','images/paperball.png');
			/*
			 * display all the photos on the desk, with a random rotation,
			 * and also make them draggable.
			 * on mouse down, we want the photo to enlarge in a few pixels,
			 * and to rotate 0 degrees
			 */
			self.cntPhotos = 0;
			
			this.element.children('div').each(function(i){
				var $photo 	= $(this);
				self._photoSetup($photo,opt);
			}).find('.phototable-photo').each(function(){
				var $photo 	= $(this);
				self._photoSetup($photo,opt);
			});
			this.options.refresh();
		 },
		 _photoSetup:function($photo,opt){
			 var self=this;
			 if(!$photo.hasClass('phototable-photo') && !$photo.hasClass('phototable-filmstrip-mask')){
					++self.cntPhotos;
					$photo.find('span').addClass('phototable-caption');
					if(!self.options.captions){
						$photo.find('.phototable-caption').hide();
					}
					$photo.addClass('phototable-photo')
						  .append('<span class="phototable-delete"></span>')
						  .find('img').width(self.options.photoW).wrap('<div class="phototable-hold">');
					$photo.find('.phototable-delete').click(function(){
						self._removePhoto(this);
					});
					$('<img />').load(function(){
						var $image 	= $(this);
						var r		= Math.floor(Math.random()*201)-100;//*41
						var maxzidx = parseInt(self._findHighestZIndex()) + 1;
						var param	= {
							'top': Math.floor(Math.random()*self.verticalMax) +'px',       
							'left': Math.floor(Math.random()*self.horizontalMax) +'px',
							'z-index': maxzidx
						};
						$photo.css(param);
						if(!self._ie()){ 
							$photo.transform({'rotate'	: r + 'deg'});
						} else {
							self._ieRotate($photo,r);
						}
						$photo.show();	
						$photo.draggable({
							containment	: self.element,
							cursorAt: {
								left:self.options.dragW/2
							}
						}).find('.phototable-delete').show();
						$photo.find('.phototable-hold').mousedown(function(e){
							self._mouseDown($photo);
							e.preventDefault();
						});
						if(typeof $photo.find('img').attr('id') !== "undefined"){
							$('<div class="facebookWrap"><img class="commentBtn" src="images/comment-button.png" /><img class="likeBtn" src="images/like-button.png" /></div>').appendTo($photo);
							if(self.options.facebookTags){
								$photo.find('.facebookWrap').append('<img class="tagBtn" src="images/tag-button.png" />');
							}
						}
						if(self.gridActive){
							self.grid();
						}
						if(self.macActive){
							self.mac();
						} else if(self.film){
							self._filmstrip();
						}
					}).attr('src',$photo.find('.phototable-hold img').attr('src'));
				} else {
					if(!self.options.captions){
						$photo.find('.phototable-caption').hide();
					} else {
						$photo.find('.phototable-caption').show();
					}
					if(self.options.facebookTags){
						if($photo.find('.tagBtn').length < 1){
							$photo.find('.facebookWrap').append('<img class="tagBtn" src="images/tag-button.png" />');
						}
					} else {
						$photo.find('.tagBtn').remove();
					}
					self.cntPhotos++;
					if(!opt && !$photo.hasClass('phototable-filmstrip-mask')) $photo.show().width(self.options.photoW).height('').find('.phototable-hold img').width(self.options.photoW);
					if(self.gridActive){
						$photo.css({'display':'inline-block','top':'','left':''});
					}
					
					
				}
				if(self.cntPhotos == self.photosCount){
					self._bindEvents();
					
				}
		 },
		 _facebookInit:function(){
			 var self = this;
			 (function(d){
				 var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
				 if (d.getElementById(id)) {return;}
				 js = d.createElement('script'); js.id = id; js.async = true;
				 js.src = "//connect.facebook.net/en_US/all.js";
				 ref.parentNode.insertBefore(js, ref);
			   }(document));
			  window.fbAsyncInit = function() {
				FB.init({
				  appId      : self.options.facebookAppId, // App ID
				  channelUrl : self.options.facebookChannelUrl, // Path to your Channel File
				  status     : true, // check login status
				  cookie     : true, // enable cookies to allow the server to access the session
				  xfbml      : true  // parse XFBML
				});
				if(self.options.facebookAlbum !== null) self.getFacebookAlbum(self.options.facebookAlbum);
				}
				
		 },
		 getFacebookAlbum:function(albumid){
			 var self = this;
			 FB.api('/'+albumid+'/photos',function(data){
				$.each(data.data,function(i,v){
					self.element.append('<div><img id="'+v.id+'" src="'+v.source+'" />'+((typeof v.name !== "undefined")?'<span>'+v.name+'</span>':'')+'</div>');
				});
				self.refresh();
				if(self.film){
					self._filmstrip();
				}
			 });
		 },
		 facebookLogin:function(callback){
			 var self = this;
			 var status = false;
			FB.getLoginStatus(function(response) {
			  if (response.status === 'connected') {
				status = true;
				 if (response.authResponse) {
					 FB.api('/me', function(response) {
						self.facebookName = response.name;
						status = true;
					   callback(status);
					 });
				   }
				
			  } else {
				login();
			  }
			 });
		 	 function login(){
				 FB.login(function(response) {
				   if (response.authResponse) {
					 FB.api('/me', function(response) {
						self.facebookName = response.name;
					   status = true;
					   callback(status);
					 });
				   } else {
					  callback(status); 
				   }
				   
				 },{scope:'publish_stream,user_photos,status_update,friends_photos,publish_actions,friends_photo_video_tags'});
			 }
		 },
		 facebookLike:function(photo){
			var $photo = $(photo).closest('.phototable-photo');
			this.facebookLogin(function(){
				FB.api('/'+$photo.find('.phototable-hold img').attr('id')+'/likes','post',function(data){
				});						
			});
		 },
		 facebookComment:function(photo){
			 var self = this;
			 var $photo = $(photo).closest('.phototable-photo');
			 self._enlarge($photo);
			 $photo.append('<textarea class="phototable-comment" placeholder="Type Comment Here..."></textarea><img class="saveBtn" src="images/save-button.png" />');
			 $photo.find('.phototable-comment').click(function(){
				$(this).focus();											   
			 });
			 $photo.find('div.facebookWrap').hide();
			 $photo.find('.saveBtn').one('click',function(){
				if(!self.macActive && !self.film){
					self.disperse(false);
				} else {
					$photo.css({'position':'relative','left':'0','top':'0','width':''}).find('.phototable-hold img').width(self.options.dragW);
					$photo.css({'margin-top':(($photo.parent().outerHeight()-$photo.height())/2)})
				}
				$(this).remove();
				$photo.find('div.facebookWrap').show();
					self.facebookLogin(function(){
					FB.api('/'+$photo.find('.phototable-hold img').attr('id')+'/comments','post',{'message':$photo.find('textarea').val()},function(data){
					});
					$photo.find('.phototable-comment').remove();						
				});
			});
		  },
		  facebookTag:function(photo){
			 var self = this;
			 var $photo = $(photo).closest('.phototable-photo');
			 self._enlarge($photo);
			 $photo.append('<input type="text" class="phototable-tagname" placeholder="Click on Person in Photo..."/><img class="saveBtn" style="display:none;" src="images/save-button.png" />');
			 $photo.find('div.facebookWrap').hide();
			 $photo.find('.phototable-hold img').click(function(e){
				$photo.find('.phototableTagBox').remove();
				e.stopPropagation();
				e.stopImmediatePropagation();
				e.preventDefault();
				var imgPos = $(this).position();
				var x = (e.offsetX/$(this).width())*100,
				y = (e.offsetY/$(this).height())*100;
				var name = '';
				/*FB.api('/me',function(response){
					name = response.id;
					console.log(JSON.stringify(response));
				});*/
				var boxW = (self.options.stackW/720)*100,
				boxTop = e.offsetY-boxW/2,
				boxLeft = e.offsetX-boxW/2;
				
				$photo.find('.phototable-hold').append('<div class="phototableTagBox" style="width:'+boxW+'px; height:'+boxW+'px; top:'+boxTop+'px; left:'+boxLeft+'px;"></div>');
				$photo.find('.saveBtn').show();
			 	$photo.find('input').attr('placeholder','Enter Name or Leave Blank for self and save ...');
				$photo.find('img.saveBtn').one('click',function(){
						if(!self.macActive && !self.film){
							self.disperse(false);
						} else if(self.macActive) {
							$photo.css({'position':'relative','left':'0','top':'0','width':''}).find('.phototable-hold img').width(self.options.dragW);
							$photo.css({'margin-top':(($photo.parent().outerHeight()-$photo.height())/2)})
						} else {
							
						}
						$(this).remove();
						
						$photo.find('div.facebookWrap').show();
							self.facebookLogin(function(){
								if($photo.find('input').val() == ""){
									var text = self.facebookName;
								} else {
									var text = $photo.find('input').val();
								}
								//Open Graph api calls to tag page photos currently fail switch to this when this is fixed
								FB.api('/'+$photo.find('.phototable-hold img').attr('id')+'/tags','post',{
										'tag_text':text,
										'x':x,
										'y':y
									},function(data){																																						
								});
								$photo.find('.phototable-tagname').remove();
								$photo.find('.phototable-hold .phototableTagBox').remove();
								$photo.find('.phototable-hold img').unbind('click');
							});										
						});
			 });
		  },
		 _setOption: function(key,value){
			 //this.element.button( "option", key, value );
			$.Widget.prototype._setOption.call(this,key,value);
			this.refresh(true);
		 },
		 slideshow:function(){
			var self = this;
			  self.refresh();
			  if(self.photosCount == 0) return;
			  this.options.navPage = 0;
			  var cnt_photos = 0;
			  this.element.find('.phototable-photo').each(function(i){
				  var $photo 	= $(this);
				  if(self.gridActive){
				  	$photo.css({'position':'fixed'});
			  	  }
				  
				  $photo.css('z-index',parseInt(self._findHighestZIndex()) + 1000 + i)
				  .stop(true)
				  .animate({
					  'top'	: parseInt((self.element.height()-100)/2 - $photo.height()/2) + 'px',
					  'left'	: parseInt((self.element.width()-100)/2 - $photo.width()/2) + 'px'
				  },800,function(){
					  var $photo = $(this);
					  ++cnt_photos;
					  var $nav 	= $('<a class="phototable-next_photo" style="display:none"></a>');
					  $nav.bind('click',function(){
						  self._navigate();
						  $(this).remove();
					  });
					  $photo.prepend($nav);
					  $photo.find('.phototable-delete').hide();
							
					  
					  if(cnt_photos == self.photosCount)
						  self._enlarge(self._findElementHighestZIndex());
				  	  });
				 
			  });
			  var runcnt = 0;
			   this.run = window.setInterval(function(){
					runcnt++;
					$('.phototable-next_photo').last().click();
					if(runcnt == self.photosCount) clearInterval(this.run);
			   },5000);
			  self.options.stack(); 
	 	 },
		 _ieRotate:function($photo,deg){
			 if($.browser.version < parseInt(9)){
				 $photo.css({'filter':"progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand')",'border-width':'10px','border-bottom-width':'28px'}).find('.phototable-delete').css({'top':'-12px','right':'-12px','background-color':'transparent'});
				  var photo = $photo[0],
				 deg2radians = Math.PI * 2 / 360;
				 rad = deg * deg2radians ;
				 costheta = Math.cos(rad);
				 sintheta = Math.sin(rad);
			
				 photo.filters.item(0).M11 = costheta;
				 photo.filters.item(0).M12 = -sintheta;
				 photo.filters.item(0).M21 = sintheta;
				 photo.filters.item(0).M22 = costheta;
			 } else {
				$photo.css({'-ms-transform':'rotate('+deg+'deg)'}); 
			 }
		 },
		 _filmstrip:function(mac){
			var self = this,
			maxHeight = 0,
			width = 0,
			height = 0;
			self.grid();
			self.film = true;
			if($('.phototable-filmstrip-mask').length == 0){
				this.element.append('<div class="phototable-filmstrip-mask"><div class="phototable-filmstrip-container"><div class="phototable-filmstrip"></div></div></div>');
			}
			self.element.find('.phototable-photo').each(function(){
				$(this).appendTo('.phototable-filmstrip	');	
				if($(this).height() > maxHeight){
					maxHeight = $(this).outerHeight(true);
					width = $(this).outerWidth(true);
					height = $(this).height();
				}
			});
			var dmh = parseInt(parseInt(self.options.dragW)/(parseInt(self.options.photoW)/parseInt(maxHeight)));
			
			if(!self.macActive){self.element.find('.phototable-photo').css({'min-height':height}); }
			
			var calcWidth = parseInt(self.element.find('.phototable-photo').css('margin-left'))*2+parseInt(self.element.find('.phototable-photo').css('padding-left'))*2+parseInt(self.options.photoW);
			console.log(calcWidth+'-'+self.photosCount+'-margin:'+parseInt(self.element.find('.phototable-photo').css('margin-left'))+'-padding:'+parseInt(self.element.find('.phototable-photo').css('padding-left'))+'-'+self.options.photoW);
			var stripWidth = calcWidth*(self.photosCount+.5);
			containerWidth = (stripWidth*2) - width;
			var left = (this.element.width()/2)-(width/2);
			if(self.macActive){
				containerWidth += width;
				$(self.element.find('.phototable-photo')[0]).addClass('phototable-mac-current').find('.phototable-hold img').width(self.options.dragW);
				self.element.find('.phototable-filmstrip-mask,.phototable-filmstrip-container, .phototable-filmstrip').height(dmh);
				newWidth = $(self.element.find('.phototable-photo')[0]).outerWidth(true);
				left = (this.element.width()/2)-(newWidth/2);
				self.element.find('.phototable-photo').each(function(){
					$(this).css({'margin-top':($(this).parent().height()-$(this).outerHeight())/2})
				});
			}
			self.element.curPos = self.element.find('.phototable-filmstrip').position().left;
			var containerLeft = ((containerWidth/2)-(self.element.width()*.5))*-1;
			self.element.sortable('destroy').find('.phototable-filmstrip').draggable({'axis':'x','containment':'.phototable-filmstrip-container'});
			$('.phototable-filmstrip-container').width(containerWidth).css({'margin-left':containerLeft}); 
			$('.phototable-filmstrip').css({'width':stripWidth,'position':'absolute','top':0,'left':left});
			if(self.macActive){
				self._macEffect();
				$('.phototable-filmstrip-mask, .phototable-filmstrip-container, .phototable-filmstrip').height(maxHeight);
			}
		 },
		 _macEffect:function(){
			 	var self = this;
				self.element.find('.phototable-filmstrip').draggable('option',{'drag':function(){
					var left = (self.element.width()/2)-(self.options.photoW*2);
					var parentHeight = $(this).outerHeight();
					$(this).find('.phototable-photo').each(function(){
						var height = $(this).outerHeight(),
						width = $(this).outerWidth(),
						thisLeft = parseInt($(this).offset().left),
						paddLR = (parseInt($(this).css('padding-right'))*2)+(parseInt($(this).css('border-right'))*2)+(parseInt($(this).css('margin-right'))*2),
						photoW = self.options.photoW+paddLR,
						dragW = self.options.dragW+paddLR;
						
						if(thisLeft > left && thisLeft < (left+photoW*3) && !$(this).hasClass('phototable-mac-current') && !$(this).is(':animated') && !$(this).find('.phototable-hold img').is(':animated')){
							var newHeight = dragW/(photoW/height);
							var marTop = ((parentHeight - newHeight)/2);
							$(this).addClass('phototable-mac-current').animate({'margin-top':marTop},400).find('.phototable-hold img').animate({'width':self.options.dragW},400);
						} else if($(this).hasClass('phototable-mac-current') && (thisLeft <= left || thisLeft >= (left+photoW*3)) && !$(this).is(':animated') && !$(this).find('.phototable-hold img').is(':animated')) {
							var newHeight = photoW/(dragW/height);
							var marTop = ((parentHeight - newHeight)/2);
							$(this).removeClass('phototable-mac-current').animate({'margin-top':marTop},400).find('.phototable-hold img').animate({'width':self.options.photoW},400);
						}
					});
				},
				stop:function(){
					var $this = $(this);
					var macTest = window.setInterval(function(){
						var left = (self.element.width()/2)-(self.options.photoW*2);
						var parentHeight = $this.outerHeight();
						$this.find('.phototable-photo').each(function(){

							var height = $(this).outerHeight(),
							width = $(this).outerWidth(),
							thisLeft = parseInt($(this).offset().left),
							paddLR = (parseInt($(this).css('padding-right'))*2)+(parseInt($(this).css('border-right'))*2)+(parseInt($(this).css('margin-right'))*2),
							photoW = self.options.photoW+paddLR,
							dragW = self.options.dragW+paddLR;
							
							if(thisLeft > left && thisLeft < (left+photoW*3) && !$(this).hasClass('phototable-mac-current') && !$(this).is(':animated') && !$(this).find('.phototable-hold img').is(':animated')){
								var newHeight = dragW/(photoW/height);
								var marTop = ((parentHeight - newHeight)/2);
								$(this).addClass('phototable-mac-current').animate({'margin-top':marTop},300).find('.phototable-hold img').animate({'width':self.options.dragW},300);
							} else if($(this).hasClass('phototable-mac-current') && (thisLeft <= left || thisLeft >= (left+photoW*3)) && !$(this).is(':animated') && !$(this).find('.phototable-hold img').is(':animated')) {
								var newHeight = photoW/(dragW/height);
								var marTop = ((parentHeight - newHeight)/2);
								$(this).removeClass('phototable-mac-current').animate({'margin-top':marTop},300).find('.phototable-hold img').animate({'width':self.options.photoW},300);
							}
						});
					},50);
					window.setTimeout(function(){
						clearInterval(macTest);					   
					},350);
				}});
				
		 },
		 mac:function(){
			var self = this;
			self.macActive = true;
			self._filmstrip(true);
		 },
		 removeFilm:function(){
			 var self = this;
			 self.macActive = false;
			 self.film = false;
			 self.gridActive = false;
			 self.element.find('.phototable-photo').each(function(){
				$(this).css({'position':'absolute'}).draggable({
					'axis':'false',
					'containment':self.element,
					'drag':function(){},
					'cursorAt':{ left:self.options.dragW/2 }
				}).removeClass('.phototable-mac-current').appendTo(self.element);
				$(this).find('.phototable-hold img').width(self.options.photoW);
			});
			self.element.find('.phototable-filmstrip-mask').remove();
		 },
		 filmstrip:function(){
			var self = this;
			self.macActive = false;
			self.element.find('.phototable-photo').each(function(){
				$photo = $(this);
				$photo.find('.phototable-hold img').width(self.options.photoW);
				$photo.parent().draggable('option','drag',function(){});
			});
			self._filmstrip();
		 },
		 destroy: function(){
			 var self = this;
			this.element.find('.phototable-enlarged').removeClass('phototable-enlarged');
			this.element.removeClass('phototable').removeClass('phototable-container').find('.phototable-photo').each(function(){
				$(this).draggable('destroy');
				$(this).removeClass('phototable-photo').find('.phototable-caption').removeClass('phototable-caption');
				$(this).attr('style','').find('.phototable-delete').remove();
				$(this).find('.facebookWrap').remove();
				$(this).find('.phototable-hold img').prependTo(this).attr('style','');
				if(self.macActive || self.film){
					$(this).prependTo(self.element);
					$('.phototable-filmstrip-mask').remove();
				}
				$(this).attr('class','');
				$(this).find('.phototable-hold').remove();
				
			});
			this.element.sortable('destroy');
			$.Widget.prototype.destroy.call( this );
		 },
		 _removePhoto:function(photo){
			 var self = this;
			  var $photo = $(photo).parent();
			  var position = $photo.position();
			  var $photoT = parseInt($photo.css('top'));
			  var $photoL =  parseInt($photo.css('left'));
			  var $photoZIndex	= $photo.css('z-index');
			  var $trash = $('<div />',{'class'	: 'phototable-paperball'}).css({
				  'position':'absolute',
				  'top':($photoT+$photo.height()/2),
				  'left':($photoL+$photo.width()/2),
				  'width':'0',
				  'height':'0',
				  'z-index':$photoZIndex+1
			  }).appendTo(self.element);
			  $trash.animate({
				  'top':$photoT,
				  'left':$photoL,
				  'height': $photo.height(),
				  'width'	: $photo.width()
			  },100,function(){
				  var $this = $(this);
				  setTimeout(function(){
					  $this.remove();
				  },1000);
			  });
			  $photo.animate({
				  'width': '0px',
				  'height': '0px',
				  'top'	: $photoT + $photo.height()/2,
				  'left': $photoL + $photo.width()/2
			  },200,function(){
				  //self.photosCount--;
				  $(this).hide();
			  });
			  this.options.remove();
		 },
		 widget: function(){
			 return this.element;
		 },
		 _mouseUp:function(photo){
			 var self = this;
			 var $photo 	= $(photo).find('.phototable-photo:nth-child('+self.options.idx+')');
			 if(!$photo.hasClass('phototable-enlarged')){
				 
				  if(self.options.mouseup){
				  self.options.mouseup = false;
				  
				  var r		= Math.floor(Math.random()*101)-50;
				  var $photoT	= parseFloat($photo.css('top'),10);
				  var $photoL	= parseFloat($photo.css('left'),10);
				  var newTop	= $photoT + r;
				  var newLeft	= $photoL + r;
				  if(self._ie()){
					  var param = {
						  'width'		: self.options.photoW,
						  'top'		: newTop + 'px', 
						  'left'		: newLeft + 'px',
						  'shadow'	: '0 0 5px #000'
					  };
					  self._ieRotate($photo,r);
				  } else {
						  var param = {
							  'width'	: self.options.photoW,
							  'top'		: newTop + 'px',
							  'left'		: newLeft + 'px',
							  'rotate'	: r+'deg',
							  'shadow'	: '0 0 5px #000'
						  };
					  }
					  if(self.gridActive){
						 var param = {
							  'width'		: self.options.photoW,
							  'shadow'	: '0 0 5px #000'
						  }; 
					  }
					  $photo.stop(true,true).animate(param,200).find('.phototable-hold img').stop(true,true).animate({
						  'width': self.options.photoW
					  },200);
				  }
			 }
		 },
		 _mouseDown:function ($photo){
			 if(!$photo.hasClass('phototable-enlarged') && !this.gridActive){
				  var self = this;
				  this.options.mouseup 	= true;
				  this.options.idx	= $photo.index() + 1;
				  var maxzidx = parseInt(self._findHighestZIndex()) + 1;
				  $photo.css('z-index',maxzidx);
				  if(self._ie()){
					  var param = {
						  'width'		: self.options.dragW,
						  'shadow'	: '5px 5px 15px #222'
					  };
					  self._ieRotate($photo,0);
				  }
				  else{
					  var param = {
						  'width'		: self.options.dragW,
						  'rotate'	: '0deg',
						  'shadow'	: '5px 5px 15px #222'
					  };
				  }
				  if(self.gridActive){
					  var param = {
						  'width'		: self.options.dragW,
						  'shadow'	: '5px 5px 15px #222'
					  };
				  }
				  $photo.stop(true,true).animate(param,100).find('.phototable-hold img').stop(true,true).animate({
					  'width'		: self.options.dragW
				  },100);
			 }
		  },
		  stack: function(){
			  var self = this;
			  self.refresh();
			  if(self.gridActive){
				  
			  }
			  if(self.photosCount == 0) return;
			  this.options.navPage = 0;
			  var cnt_photos = 0;
			  this.element.find('.phototable-photo').each(function(i){
				var $photo 	= $(this);
				if(self.gridActive){
				  	$photo.css({'position':'fixed'});
			  	}
				$photo.css('z-index',parseInt(self._findHighestZIndex()) + 1000 + i)
				.stop(true)
				.animate({
					'top'	: parseInt((self.element.height()-100)/2 - $photo.height()/2) + 'px',
					'left'	: parseInt((self.element.width()-100)/2 - $photo.width()/2) + 'px'
				},800,function(){
					var $photo = $(this);
					++cnt_photos;
					var $nav 	= $('<a class="phototable-next_photo" style=""></a>');
					$nav.bind('click',function(){
						self._navigate();
						$(this).remove();
					});
					$photo.prepend($nav);
					$photo
					.find('.phototable-delete')
					.hide();
					if(cnt_photos == self.photosCount){
						self._enlarge(self._findElementHighestZIndex());
					}
				});
			  });
			  self.options.stack();
		  },
		  _enlarge: function($photo){
			  var self = this;
			  //var param = new Object();
			  $photo.addClass('phototable-enlarged');
			  if(self._ie()){
				  var param = {
					  'width': self.options.stackW,
					  'top'	: parseInt((self.element.height()-100)/2 - ($photo.height()+200)/2) + 'px',
					  'left': parseInt((self.element.width()-100)/2 - ($photo.width()+200)/2) + 'px',
					  'z-index':self._findHighestZIndex()+1,
					  'shadow': '5px 5px 15px #222'
				  };
				  self._ieRotate($photo,0);
			  }
			  else{
				 var param = {
					  'width': self.options.stackW,
					  'top':'50px',
					  'left': ($(window).width()/2)-(self.options.stackW/2),
					  'rotate': '0deg',
					  'z-index':self._findHighestZIndex()+1,
					  'shadow': '5px 5px 15px #222'
				  };
			  }
			  $photo.css({'position':'fixed'}).animate(param,500,function(){
				  self.options.idxLarge = $(this).index();
			  }).find('.phototable-hold img').animate({
				  'width'	: self.options.stackW
			  },500);
		  },
		  disperse: function(shuffle){
			  var self = this;
			  if(self.photosCount == 0) return;
			  var r	= Math.floor(Math.random()*201)-100;
			  this.element.find('.phototable-photo').each(function(i){
				  var $photo 		= $(this);
				  //if it is the current large photo:
				  if($photo.index() == self.options.idxLarge){
					  if(self._ie()){
						  var param = {
							  'top'		: parseInt((self.element.height()-100)/2 - $photo.height()/2) + 'px', 
							  'left'		: parseInt((self.element.width()-100)/2 - $photo.width()/2) + 'px',
							  'width'		: self.options.photoW
						  };
						   self._ieRotate($photo,r);
					  } else {
						  var param = {
							  'top'		: parseInt((self.element.height()-100)/2 - $photo.height()/2) + 'px', 
							  'left'		: parseInt((self.element.width()-100)/2 - $photo.width()/2) + 'px',
							  'width'		: self.options.photoW,
							  'rotate': r+'deg',
							  'shadow'	: '1px 1px 5px #555'
						  };
					  }
					  if(self.gridActive && !shuffle){
						  var param = {
							  'width'		: self.options.photoW,
							  'shadow'	: '5px 5px 15px #222'
						  };
					  }
					  $photo.stop(true).animate(param,500, function(){
						  if(shuffle !== false) self.shuffle();
					  }).find('.phototable-hold img').animate({
						  'width'		: self.options.photoW
					  },500);
					  
					  if(self.gridActive){
						  self.element.find('.phototable-enlarged').removeClass('phototable-enlarged').css({'position':'relative',top:0,left:0});
					  } else {
						  self.element.find('.phototable-enlarged').removeClass('phototable-enlarged').css('position','absolute');
					  }
				  }
			  });
			  
			   this.element.find('.phototable-next_photo').remove();
			  if(!self.macActive) self.refresh();
		  },
		  _bindEvents: function(){
			  var self = this;
			  
		  },
		  _navigate: function(){
			  var self = this;
			  if(this.photosCount == 0) return;
			  var $photo =  this.element.find('.phototable-photo:nth-child('+parseInt(self.options.idxLarge+1)+')');
			  var r	= Math.floor(Math.random()*201)-100;//*41
			  if(self._ie()){
				  var param = {
					  'top': Math.floor(Math.random()*self.verticalMax) +'px',       
					  'left': Math.floor(Math.random()*self.horizontalMax) +'px',
					  'width': self.options.photoW,
					  'shadow': '1px 1px 5px #555'
				  };
				  self._ieRotate($photo,r);
			  } else {
				  var param = {
					  'top': Math.floor(Math.random()*self.verticalMax) +'px',
					  'left': Math.floor(Math.random()*self.horizontalMax) +'px',
					  'width': self.options.photoW,
					  'rotate': r+'deg',
					  'shadow': '1px 1px 5px #555'
				  };
			  }
			  $photo.stop(true).animate(param,500,function(){
				  ++self.options.navPage;
				 
				  
				  $photo.css('z-index',1);
				  if(self.options.navPage < (self.photosCount)){
					  self._enlarge(self._findElementHighestZIndex());
					  if(self.film){
						 $photo.css({'position':'relative','top':'','left':'','-webkit-transform':'rotate(0deg)','width':''}); 
					  }
				  }
				  else{ //last one
				  	  if(self.film){
						 $photo.css({'position':'relative','top':'','left':'','-webkit-transform':'rotate(0deg)','width':''});
					  }
					  self.element.find('.phototable-delete').show();
				  }
			  }).find('.phototable-hold img').animate({
				  'width': self.options.photoW
			  },500,function(){
				  
			  if(self.options.navPage >= self.photosCount && self.film){
				  self.mac();
			  }
			  });
			  self.element.find('.phototable-enlarged').removeClass('phototable-enlarged').css('position','absolute');
		  },
		  shuffle: function(){
			  var self = this;
			  if(self.film || self.macActive || self.gridActive){
				 self.removeFilm(); 
			  }
			  if(self.photosCount == 0) return;
			   this.element.find('.phototable-photo').each(function(i){
				  var $photo = $(this);
				  var r		= Math.floor(Math.random()*301)-100;//*41
				  if(self._ie()){
					  var param = {
						  'top' 		: Math.floor(Math.random()*self.verticalMax) +'px',       
						  'left'		: Math.floor(Math.random()*self.horizontalMax) +'px'
					  };
					  self._ieRotate($photo,r);
				  } else {
					  var param = {
						  'top' 		: Math.floor(Math.random()*self.verticalMax) +'px',
						  'left'		: Math.floor(Math.random()*self.horizontalMax) +'px',
						  'rotate'	: r+'deg'
					  };
				  }
				  $photo.animate(param,800);
			  });
			   self.options.shuffle();
		  },
		  _findHighestZIndex: function(){
			  var photos =  this.element.find('.phototable-photo');
			  var highest = 0;
			  photos.each(function(){
				  var $photo = $(this);
				  var zindex = $photo.css('z-index');
				  if (parseInt(zindex) > highest) {
					  highest = zindex;
				  }
			  });
			  return highest;
		  },
		  _findElementHighestZIndex: function(){
			  var photos =  this.element.find('.phototable-photo');
			  var highest = 0;
			  var $elem;
			  photos.each(function(){
				  var $photo = $(this);
				  var zindex = $photo.css('z-index');
				  if (parseInt(zindex) > highest) {
					  highest = zindex;
					  $elem	= $photo;
				  }
			  });
			  return $elem;
		  }
				
		  
});