class WelcomeController < ApplicationController
	before_action :authenticate_user!
	before_action :set_user, only: [:updatepos, :index, :starttracking, :stoptracking, :updateothers]
	

  def index
    if (User.find(current_user.id).approved)
    	gon.active = true
    	gon.watch.user_signed_in = user_signed_in?
    	gon.watch.user = @user
    	markerArray = []
      inviteArray = []
    	@users = User.all
    	@users.each do |x|
    		if (x != current_user) && x.tracking && (x.room == @user.room)
    			markerArray.push({ lat: x.lat.to_f, lng: x.lng.to_f, name: x.name, icon: x.icon, userid: x.id })
    		end
    	end
    	gon.watch.markerArray = markerArray

      if (@user.invite != @user.room)
        gon.watch.inviter = User.find(@user.invite)
      end

      if (@user.room == @user.id)
        gon.watch.roomName = "Your Group"
      else
        gon.watch.roomName = "" + @users.find(@user.room).name.to_s + "'s Group"
      end

      gon.watch.inviteUsers = User.all.where.not({room: @user.id}).where.not({invite: @user.id}).order(:name)

      gon.watch.removeUsers = User.all.where({room: @user.id})
   
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

  def updateothers
    if User.find(user_params[:userid]).update({invite: user_params[:invite]})
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
		params.permit(:lat, :lng, :tracking, :room, :invite, :userid)
	end

	def set_user   
		@user = User.find(current_user.id)
	end

end
