# Goldcloaks Bot

**Eldritch Road** is a moderation bot for dnd5e. 

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/OldSociety/eldritch-road-bot.git
cd eldritch-road-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

In the root of your project, create a `.env` file and add the following variables:

```env
TOKEN=your-discord-bot-token
GUILDID=your-discord-guild-id
CLIENTID=your-bot-id
ADMINROLEID=your-admin-role-id
SMASTERROLEID=your-server-master-role-id
MODERATORROLEID=your-moderator-role-users
SUPPORTCATID=support-category-role
BOTTESTCHANNELID=channel-id-for-testing
MODERATORCHANNELID=moderator-channel-id

DATABASE_URL=sqlite://dev.sqlite # SQLite file for development
```

#### Optional: Create `.env.development` or `.env.production`

For specific environments create `.env.development` or `.env.production` files with the corresponding environment-specific configurations.

### 4. Running Migrations

```bash
npx sequelize-cli db:migrate --env development
```

### 5. Deploy Commands

```bash
node deploy-commands.js
```

### 6. Run the Bot

For development:

```bash
npm run start:dev
```

For production:

```bash
npm run start:prod
```
