class WelcomeController < ApplicationController
	before_action :authenticate_user!, only: [:index, :updatepos, :updateinvite, :updateroom, :updatedeclined, :updateremoved, :starttracking, :stoptracking, :savepicture]
	before_action :set_user, only: [:updatepos, :index, :starttracking, :stoptracking, :updateinvite, :updateroom, :updatedeclined, :updateremoved, :savepicture ]

  def index
    gon.active = true
    # if (User.find(current_user.id).approved)
    if (true)
    	gon.watch.user_signed_in = user_signed_in?
    	gon.watch.user = @user
    	markerArray = []
      inviteArray = []
    	@users = User.all
    	@users.each do |x|
    		if (x != current_user) && x.tracking && (x.room == @user.room)
          if (File.exist?('./public/' + x.id.to_s + '.png'))
            iconFile = '/' + x.id.to_s + '.png'
          else
            iconFile = '/noavatar.png'
          end
    			markerArray.push({ lat: x.lat.to_f, lng: x.lng.to_f, displayname: x.displayname, icon: (iconFile), userid: x.id })
    		end
    	end

      if (@user.room == @user.id)
        gon.watch.roomName = "Your group"
      else
        gon.watch.roomName = "" + @users.find(@user.room).displayname.to_s + "'s group"
      end

      gon.watch.markerArray = markerArray
      gon.watch.inviter = User.find(@user.invite)
      gon.watch.inviteUsers = User.all.where.not(id: @user.id).where.not({room: @user.id}).where.not({invite: @user.id}).order(:displayname)
      gon.watch.removeUsers = User.all.where({room: @user.id}).where.not({id: @user.id})
      gon.watch.declinedUser = User.find(@user.declined)
      gon.watch.removedUser = User.find(@user.removed)
    end
  end

  def updatepos
    if @user.update(user_params)
    	# puts "UPDATED DATABASE WITH NEW LOCATION"
    	render :nothing => true, :status => 200, :content_type => 'text/html'
    else
      # puts "OH SHIT"
      render :nothing => true, :status => 200, :content_type => 'text/html'
    end
  end

  def updateinvite
    if User.find(user_params[:userid]).update({invite: user_params[:invite]})
      render :nothing => true, :status => 200, :content_type => 'text/html'
    else
      render :nothing => true, :status => 200, :content_type => 'text/html'
    end
  end

  def updateroom
    if User.find(user_params[:userid]).update({room: user_params[:room]})
      render :nothing => true, :status => 200, :content_type => 'text/html'
    else
      render :nothing => true, :status => 200, :content_type => 'text/html'
    end
  end


  def updatedeclined
    if User.find(user_params[:userid]).update({declined: user_params[:declined]})
      render :nothing => true, :status => 200, :content_type => 'text/html'
    else
      render :nothing => true, :status => 200, :content_type => 'text/html'
    end
  end

  def updateremoved
    if User.find(user_params[:userid]).update({removed: user_params[:removed]})
      render :nothing => true, :status => 200, :content_type => 'text/html'
    else
      render :nothing => true, :status => 200, :content_type => 'text/html'
    end
  end
  

  def starttracking
  	updateTracking(true)
  end

  def stoptracking
  	updateTracking(false)
  end

  def sentconfirmation
    render :setconfirmation => true, :status => 200, :content_type => 'text/html'
  end

  def savepicture
    filename = 'public/' + current_user.id.to_s + '.png'
    File.open(filename, 'wb') do |f|
      f.write(Base64.decode64(user_params[:savepicture]))
    end
    render :nothing => true, :status => 200, :content_type => 'text/html'
  end



  private

  def updateTracking(tracking)
		@user.tracking = tracking;
		if @user.save
			redirect_to root_path
		else
			# puts "OH SHIT"
			render :nothing => true, :status => 200, :content_type => 'text/html'
		end
  end

  def user_params
		params.permit(:lat, :lng, :tracking, :room, :invite, :userid, :displayname, :firstname, :lastname, :declined, :removed, :savepicture)
	end

	def set_user   
		@user = User.find(current_user.id)
    if (File.exist?('./public/' + @user.id.to_s + '.png'))
      iconFile = '/' + @user.id.to_s + '.png'
    else
      iconFile = '/noavatar.png'
    end
    @user.icon = iconFile
	end

end
