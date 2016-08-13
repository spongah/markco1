class WelcomeController < ApplicationController
	before_action :authenticate_user!
  def index
  	gon.active = true;
  	gon.user_signed_in = user_signed_in?

  end
end
