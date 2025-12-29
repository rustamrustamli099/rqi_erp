# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications alt+T"
  - generic [ref=e5]:
    - generic [ref=e6]:
      - img "RQI ERP Logo" [ref=e9]
      - heading "Welcome back" [level=3] [ref=e10]
      - paragraph [ref=e11]: Enter your credentials to access your tenant dashboard.
    - generic [ref=e13]:
      - generic [ref=e14]:
        - text: Email
        - textbox "Email" [ref=e15]:
          - /placeholder: name@example.com
      - generic [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18]: Password
          - link "Forgot password?" [ref=e19] [cursor=pointer]:
            - /url: /forgot-password
        - generic [ref=e20]:
          - textbox "Password" [ref=e21]
          - button [ref=e22] [cursor=pointer]:
            - img [ref=e23]
      - generic [ref=e26]:
        - checkbox "Remember me for 30 days" [ref=e27] [cursor=pointer]
        - checkbox
        - generic [ref=e28]: Remember me for 30 days
      - button "Sign In" [ref=e29] [cursor=pointer]
    - paragraph [ref=e31]: © 2025 RQI ERP System. All rights reserved.
```