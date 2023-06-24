# PayMeNow

This repository is the backbone of a robust and comprehensive automated recurring payments project named "PayMeNow". Built using Node.js, Express.js, and MongoDB, this project integrates with Australia Post's SecurePay's testing API to automate various financial transactions.

Over a span of 4 months, the system was hosted on an AWS server and processed more than $12,000 in test payments, demonstrating its robustness and effectiveness. The platform is equipped to handle various payment operations such as cancellations, refunds, adjustments to pay cycles, modifications to payment plans, and user management, all through a user-friendly, web-based graphical user interface.

Key Features:
1. **SecurePay Integration**: The project uses SecurePay's testing API, enabling the application to offer a fully automated recurring payments system.
2. **Dynamic Payment Links**: Account managers can create unique links containing payment schedules and details for clients. These links lead to SecurePay-provided iframe forms for credit card information input, enhancing security and user-friendliness.
3. **Express.js Middlewares and Passport.js Authentication**: The application efficiently uses Express.js middlewares for request handling and Passport.js for authentication, ensuring secure and efficient operation.
4. **HTTPS and Secure Environment**: The system communicates via HTTPS and operates in a secure environment for safe and reliable processing of payments.

This project is a testament to modern, secure, and efficient payment processing solutions. Whether you're seeking to understand payment integrations, exploring recurring payment systems, or studying robust application architecture, "PayMeNow" offers valuable insights.

*Note: To use this project, you must have Node.js, Express.js, and MongoDB installed and configured. Please refer to the "Installation" section of the documentation for more information on how to set up and run this project.*
