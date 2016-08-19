class WelcomeController < ApplicationController
	before_action :authenticate_user!
	before_action :set_user, only: [:updatepos]

  def index
  	markerArray = []
  	gon.active = true
  	gon.user_signed_in = user_signed_in?
  	

  	@users = User.all
  	@users.each do |x|
  		if (x != current_user) && (x.tracking = true)
  			markerArray.push({ lat: x.lat.to_f, lng: x.lng.to_f, name: x.email })
  		end
  	end

  	gon.markerArray = markerArray
  end

  def updatepos
      if @user.update(user_params)
      	# puts "UPDATED DATABASE WITH NEW LOCATION"
      	render :nothing => true, :status => 200, :content_type => 'text/html'
      else
        # puts "OH SHIT"
      end
  end

  private

  def user_params
			params.permit(:lat, :lng)
	end

	def set_user
			@user = User.find(current_user.id)
	end

end
