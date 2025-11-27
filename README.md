# Health Insurance Backend (Node.js MVC)

This repository contains a sample implementation of a health insurance backend API built with **Node.js**, **Express**, and the **Model‑View‑Controller (MVC)** pattern.  It demonstrates how you can structure your code to keep business logic separate from data access and HTTP controllers while accommodating plan‑specific premium calculation rules such as discounts for different insurers.

## Project Structure

The core idea behind MVC is to split the application into three interconnected layers: models handle the database, views handle presentation (not used here since this is an API), and controllers handle the request logic.  The LogRocket tutorial on structuring a Node.js MVC app emphasises that the model layer holds database logic, the view layer interacts with the user, and the controller acts as the intermediary between the two【144527418151976†L120-L155】.  This sample implements the model and controller layers.

```
health-insurance-backend/
├── package.json               # Dependencies and scripts
├── .env.example               # Example environment variables for DB connection
├── src/
│   ├── app.js                 # Express server setup
│   ├── config/
│   │   └── db.js              # MySQL pool configuration
│   ├── models/
│   │   ├── companyModel.js    # Data access for companies
│   │   ├── planModel.js       # Data access for plans
│   │   └── premiumModel.js    # Data access and parsing logic for premiums
│   ├── controllers/
│   │   ├── hdfcController.js  # HDFC‑specific premium logic
│   │   └── nicController.js   # NIC‑specific premium logic
│   └── routes/
│       ├── hdfcRoutes.js      # Route definitions for HDFC
│       └── nicRoutes.js       # Route definitions for NIC
└── README.md                  # Project documentation
```

### Models

* **CompanyModel** – wraps queries to the `company` table.  The `findActiveById` method returns an active (status = 1) company or `null` if inactive.
* **PlanModel** – wraps queries to the `plan` table.  The `findActivePlan` method returns an active plan for a given company and plan ID or `null` otherwise.
* **PremiumModel** – contains logic for reading plan‑specific premium tables.  The `findPremiumForMember` method takes a table name, cover amount, age, zone, and household composition (number of adults and children).  It loads rows for the zone, matches the age band (e.g. `18-30`, `>60`) and household composition, and returns the premium stored in the column matching the sum insured (e.g. `c_500000`).  Common patterns (numeric ranges and open‑ended ages) are parsed; if an age band cannot be parsed, a simple string match is attempted.

### Controllers

Two controllers are provided to illustrate custom discount logic per insurer:

* **HDFC controller** (`hdfcController.js`)
  * Accepts JSON payloads containing the sum insured (`coverAmount`), zone, proposer age, spouse age, and up to four child ages.
  * Computes the number of adults and children from the payload.
  * Retrieves the plan‑specific premium table name by combining the company and plan names.
  * Fetches base premiums for each member using the PremiumModel.
  * If the plan’s `policy_type` is not `individual` and there is more than one insured member, applies a **55 % discount** to all members except the eldest member, who pays full price.
  * Returns a breakdown of premiums per member as well as totals.

* **NIC controller** (`nicController.js`)
  * Similar to the HDFC controller but applies a flat **10 % discount** to every member when there are multiple members in the policy.  Individual policies do not receive a discount.

Both controllers check that the company and plan are active before processing the request.  If no matching premium is found for a given age band, zone, cover amount, or household composition, a `404` response is returned.

### Routes

Routes live in the `src/routes` folder.  Each company has its own route namespace to separate logic clearly:

* `POST /api/hdfc/:companyId/:planId/premium` – Calculate the premium under the HDFC rules.
* `POST /api/nic/:companyId/:planId/premium` – Calculate the premium under the NIC rules.

### Running the API

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the `.env.example` file to `.env` and update the database connection settings to point to your MySQL server:

   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. Start the server:

   ```bash
   npm start
   ```

   The server will listen on port `3000` by default.  You can override the port via the `PORT` environment variable.

4. Make a request.  For example, to calculate the premium for an HDFC plan with ID `101` belonging to company `1`:

   ```bash
   curl -X POST http://localhost:3000/api/hdfc/1/101/premium \
     -H "Content-Type: application/json" \
     -d '{
       "coverAmount": 500000,
       "zone": "1",
       "age": 34,
       "sage": 31,
       "c1age": 5,
       "c2age": null,
       "c3age": null,
       "c4age": null
     }'
   ```

   The response will include the base premium per member, the discounted premium according to HDFC rules, and the total discount applied.

### Customising for Other Insurers

This sample uses multiple controllers to handle plan‑specific business rules.  To add support for additional companies or plans:

1. **Create a new controller** in `src/controllers` that expresses the discount logic for the new insurer.
2. **Add a new route** file in `src/routes` that mounts the controller at a meaningful path.
3. **Register the route** in `src/app.js` using `app.use('/api/<insurer>', yourRoutes)`.
4. Ensure that your premium tables follow the naming convention or adapt the table lookup logic accordingly.

Because this repository focuses on the backend API, there is no view layer.  However, the underlying MVC principles still apply—the models isolate data access, the controllers encapsulate business logic, and the routes map HTTP verbs and paths to controllers.

## Disclaimer

This code is a simplified demonstration meant to illustrate structure and business logic.  In a production application you should:

* Validate and sanitise all user input thoroughly.
* Use parameterised queries or an ORM to avoid SQL injection.
* Handle database errors and edge cases more robustly.
* Add authentication/authorisation where appropriate.
* Write unit and integration tests around your premium calculation logic.

By following the MVC pattern, you can keep your codebase modular and maintainable as your API grows【144527418151976†L120-L155】.