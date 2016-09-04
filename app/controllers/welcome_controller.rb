class WelcomeController < ApplicationController
	before_action :authenticate_user!, only: [:index, :updatepos, :updateinvite, :updateroom, :updatedeclined, :updateremoved, :starttracking, :stoptracking]
	before_action :set_user, only: [:updatepos, :index, :starttracking, :stoptracking, :updateinvite, :updateroom, :updatedeclined, :updateremoved ]
	

  def index
    gon.active = true
    # if (User.find(current_user.id).approved)
    if (true)
    	gon.watch.user_signed_in = user_signed_in?
    	gon.watch.user = User.find(current_user.id)
    	markerArray = []
      inviteArray = []
    	@users = User.all
    	@users.each do |x|
    		if (x != current_user) && x.tracking && (x.room == @user.room)
    			markerArray.push({ lat: x.lat.to_f, lng: x.lng.to_f, name: x.displayname, icon: x.icon, userid: x.id })
    		end
    	end
    	gon.watch.markerArray = markerArray

      if (@user.invite != @user.room)
        gon.watch.inviter = User.find(@user.invite)
      end

      if (@user.room == @user.id)
        gon.watch.roomName = "Your Group"
      else
        gon.watch.roomName = "" + @users.find(@user.room).displayname.to_s + "'s Group"
      end

      gon.watch.inviteUsers = User.all.where.not({room: @user.id}).where.not({invite: @user.id}).order(:displayname)

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
		params.permit(:lat, :lng, :tracking, :room, :invite, :userid, :displayname, :firstname, :lastname, :declined, :removed)
	end

	def set_user   
		@user = User.find(current_user.id)
	end

end
