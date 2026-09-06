# JB WhatsApp Group Manager

Mobile-first WhatsApp distribution workflow manager for JB Digital.

## MVP features

- Group Master
- Group category, area and priority
- Admin-only protection
- Admin-only groups cannot be added to the active master list
- Search groups
- Campaign message composer
- Select eligible groups
- Batch size control from 1 to 5
- Configurable gap between batches
- Automatic delivery queue generation
- Local browser persistence for Group Master

## Important

This MVP manages recipients, eligibility, batches and campaign workflow. It does not bypass WhatsApp restrictions or automatically operate WhatsApp's user interface.

## Run

```bash
npm install
npm run dev
```

## Next planned modules

- Group Sets
- Communities
- Channels
- Personal recipients
- Supabase persistence and login
- Campaign history
- Sent / Pending / Skipped state
- Media attachments
- PWA install support
