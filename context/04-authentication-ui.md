Read AGENTS.md first and follow it strictly.

Implement the Sign Up screen exactly as shown in the attached design. Then create a matching Sign In screen using the same layout and visual style, but with sign-in copy and no password field. Both screens should use email and social auth UI only. Also, both screens should be visible on a single view(I don't want to have to scroll to see all the content of both the sign-up and sign-in screens)

Update onboarding so pressing Get Started navigates to the Sign Up screen. 

When the main Sign Up or Sign In button is pressed, show a verification modal saying the user has received an email and should enter the verification code. 

The code should be 6 digits, use the number pad, keep the modal above the keyboard, and automatically navigate to the home route (/) when the last digit is entered.

@auth-screen.png