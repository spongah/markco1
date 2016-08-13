class WelcomeController < ApplicationController
  def index
  	gon.active = true;
  end
end
