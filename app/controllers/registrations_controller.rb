class RegistrationsController < Devise::RegistrationsController


  private

  def sign_up_params
    params.require(:user).permit(:displayname, :firstname, :lastname, :email, :password, :password_confirmation)
  end

  def account_update_params
    params.require(:user).permit(:displayname, :firstname, :lastname, :email, :password, :password_confirmation, :current_password)
  end


  protected

  def after_inactive_sign_up_path_for(resource)
    '/sentconfirmation' # Or :prefix_to_your_route
  end

end