# How to generate the ER diagram

## Steps

1. Go to [https://dbdiagram.io](https://dbdiagram.io)
2. Click **"Create your diagram"**
3. Delete all default content in the left panel
4. Open `database/er_diagram.dbml` and paste the full contents
5. The diagram renders automatically on the right
6. Click **Export** → **Export to PNG** — save as `database/er_diagram.png`
7. Click **Export** → **Export to PDF** — include in the memoria

## Table colour coding (set manually in dbdiagram.io)

Click each table header to open its style options:

| Table | Colour | Hex |
|---|---|---|
| `users_customuser` | Green | `#2fac66` |
| `trades_trade` | Blue | `#4d9fff` |
| `analysis_aiinsight` | Purple | `#a78bfa` |
| `analysis_chatmessage` | Purple | `#a78bfa` |
| `mentors_mentorrequest` | Amber | `#f5a623` |
| `mentors_mentorassignment` | Amber | `#f5a623` |
| `mentors_mentorannotation` | Amber | `#f5a623` |
| `token_blacklist_outstandingtoken` | Grey | `#9ca3af` |
| `token_blacklist_blacklistedtoken` | Grey | `#9ca3af` |

## Suggested layout

Arrange tables in this rough order for readability:

```
[users_customuser]  ←  central — place in the middle

Left column:                Right column:
[trades_trade]              [analysis_aiinsight]
[mentors_mentorannotation]  [analysis_chatmessage]

Bottom row:
[mentors_mentorrequest]
[mentors_mentorassignment]

Bottom-right:
[token_blacklist_outstandingtoken]
[token_blacklist_blacklistedtoken]
```

## Key relationships shown in the diagram

| From | Relationship | To |
|---|---|---|
| `trades_trade` | many → one | `users_customuser` |
| `analysis_aiinsight` | many → one | `users_customuser` |
| `analysis_chatmessage` | many → one | `users_customuser` |
| `mentors_mentorrequest.mentor_id` | many → one | `users_customuser` |
| `mentors_mentorrequest.trader_id` | many → one | `users_customuser` |
| `mentors_mentorassignment.mentor_id` | many → one | `users_customuser` |
| `mentors_mentorassignment.trader_id` | many → one | `users_customuser` |
| `mentors_mentorannotation.mentor_id` | many → one | `users_customuser` |
| `mentors_mentorannotation.trade_id` | many → one | `trades_trade` |
| `token_blacklist_outstandingtoken` | many → one | `users_customuser` |
| `token_blacklist_blacklistedtoken` | one → one | `token_blacklist_outstandingtoken` |
