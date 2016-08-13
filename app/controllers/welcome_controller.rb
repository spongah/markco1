class WelcomeController < ApplicationController
	before_action :authenticate_user!
  def index
  	markerArray = []
  	gon.active = true
  	gon.user_signed_in = user_signed_in?
  	

  	@users = User.all
  	@users.each do |x|
  		if x != current_user
  			markerArray.push({ lat: x.lat.to_f, lng: x.lng.to_f, name: x.email })
  		end
  	end

  	gon.markerArray = markerArray
  end
end
