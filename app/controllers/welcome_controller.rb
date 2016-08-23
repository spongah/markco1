class WelcomeController < ApplicationController
	before_action :authenticate_user!
	before_action :set_user, only: [:updatepos, :index, :starttracking, :stoptracking]
	

  def index
  	gon.active = true
  	gon.user_signed_in = user_signed_in?
  	gon.user = @user
  	markerArray = []
  	@users = User.all
  	@users.each do |x|
  		if (x != current_user) && x.tracking
  			markerArray.push({ lat: x.lat.to_f, lng: x.lng.to_f, name: x.name, icon: x.icon, userid: x.id })
  		end
  	end
  	gon.watch.markerArray = markerArray
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
			params.permit(:lat, :lng, :tracking)
	end

	def set_user
			@user = User.find(current_user.id)
	end

end
