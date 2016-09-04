class CustomSessionsController < Devise::SessionsController
  before_filter :before_login, :only => :create
  after_filter :after_login, :only => :create

  def before_login
  end

  def after_login
  	User.find(current_user.id).update({ room: current_user.id, invite: current_user.id, 
  		declined: current_user.id, removed: current_user.id, tracking: true })  # SET ALL VALUES TO DEFAULT (USER ID)
  end
end