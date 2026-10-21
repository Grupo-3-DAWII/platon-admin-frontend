# Platon Admin Frontend

Angular administration panel for Librería Platón.

## Account integration

This change connects **Account only**. Products, inventory, orders, sales and reports retain their existing implementation.

```sh
npm ci
npm start
```

Open http://localhost:4200. Start PostgreSQL with the latest DATABASE init, Eureka (8761), Config Server (8888), Account (8083) and the API Gateway (8080) first.

`proxy.conf.json` forwards `/api/v1/login` and `/api/accounts` to the gateway. `/api/roles` goes to Account because the current gateway does not expose that route. This proxy belongs to the frontend and requires no backend source changes. Production hosting must provide the same reverse-proxy routes; `ng serve` proxy settings are development-only. Both environments use same-origin `/api` requests.

Login consumes `{ "access_token": "..." }`, reads the token expiry, then retrieves `/api/accounts/{idUser}` with Bearer authentication to obtain the current account and role. Passwords are not stored. The session is kept in sessionStorage and cleared on logout, expiry or API 401.

- ADMIN: existing panel pages and staff account administration.
- SELLER: product consultation, orders, sales, customers and help. Administration pages, inventory, product creation and editing are blocked by navigation guards, including direct URLs.
- USER (CUSTOMER): shopper account; cannot sign into this internal panel. The store remains a separate project.

These are frontend navigation rules. Backend role authorization remains outside this change.

Staff lists use `/api/accounts/staff`; customers use `/api/accounts` filtered by USER/CUSTOMER. The adapter follows all paginated responses before applying the existing local search, sorting and pagination. This suits the current class dataset; large datasets would need backend search and sorting support.

Staff creation and updates send the real `idRole` returned by `/api/roles`. A blank password on edit is omitted. Deactivation uses PUT with an inactive status, preserving the account; DELETE is not used. Account does not expose a status catalog, so `src/app/core/configuration/account.config.ts` declares active=1 and inactive=2 from the supplied DATABASE init. The panel disables edits if observed account states contradict that mapping. Update this configuration if a different database uses different status IDs.

The customer screen shows the paid purchase count and total returned by Account, plus contact details. Purchase totals use current catalog prices, as the backend does not store historical prices. Last-login timestamps are not displayed because the current API does not return them. Existing gateway tokens remain valid until expiry after another account is edited or deactivated; the backend currently checks active status at login only.

## Validation

```sh
npm run build
npm test -- --watch=false
```

## Reusable row actions

`RowActions` (`shared/components/row-actions`) accepts an accessible row label and an array of actions (`id`, `label`, optional `icon`, `danger`, `disabled`). Its `selected` output emits the action ID; each page owns its actual view, edit and deactivation behavior. Native popovers keep the menu above table overflow, dismiss on outside clicks or Escape, and support arrow-key navigation.

Users and Customers share this component. Customer edits preserve the existing role and omit passwords and read-only purchase/date fields. Deactivation uses Account's update endpoint. Seller access to customers remains read-only.

## Account input rules

Users and Customers share field definitions, validators and input sanitization. Names preserve Unicode letters, accents, spaces, apostrophes and hyphens and remove digits. Usernames accept letters, digits, dots, underscores and hyphens; new accounts receive a suggestion from their first name and surname joined together (José Pérez → joseperez). Suggestions remain editable and existing usernames are preserved when editing account names. No random characters or numeric suffixes are added.

Whitespace and invisible control characters are cleaned; contacts allow international phone punctuation and require 7–15 digits, and emails require a domain suffix. Passwords are never trimmed and are checked against BCrypt's 72-byte limit. Before saving, the form checks existing account usernames, emails and normalized contacts for duplicates, excluding the current account on updates. Field messages are short and specific. These checks belong to the frontend; server validation and database constraints remain the final authority.

## Responsive layout and list filters

Dashboard, Customers, Users, Reports and Help adapt to mobile, tablet and desktop. The shared shell uses a collapsible mobile sidebar and asks for confirmation before signing out. Dashboard recent orders are informational; View all opens Orders. Individual order details are not available yet.

Customers can filter by paid purchase history and registration dates. Users can filter by ADMIN/SELLER and registration dates. Additional filters combine with state tabs and search. Date boundaries are inclusive; accounts without a registration date are excluded only when a date range is active. Clearing additional filters preserves the state and search.

The full lint command currently reports pre-existing empty handlers in Products, Inventory, Orders and Sales. These modules remain outside the Account integration scope.
