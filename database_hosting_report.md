# Database Hosting Report

## 1. Database Hosting Platform
**Supabase** has been selected as the database hosting platform for the Zinko project. Supabase provides a fully managed, highly scalable PostgreSQL database.

## 2. Rationale for Selection
Supabase was chosen for several key reasons:
- **Robust Relational Foundation**: It is built on PostgreSQL, one of the most reliable and feature-rich open-source relational database systems available. This ensures data integrity and supports complex queries, which is vital for a quiz and strategy application.
- **Developer Experience**: Supabase provides automatic REST APIs based on the database schema, and works seamlessly with modern tools like Prisma ORM.
- **Connection Pooling**: It offers built-in connection pooling, which is essential for serverless environments (like Next.js) to prevent database connection limits from being exhausted. This is reflected in the configuration using the pooled connection URL.
- **Ease of Use**: It provides an excellent dashboard for managing tables, executing SQL queries, and handling migrations without needing to set up a local database admin tool immediately.

## 3. Estimated Monthly Cost
- **Current Cost**: **$0 / month**
- **Details**: We are currently utilizing Supabase's generous "Free" tier. This tier includes:
  - Up to 500 MB of database space
  - 2 GB of bandwidth per month
  - 50,000 monthly active users
  - Shared CPU and RAM resources
- **Future Scaling**: If the application exceeds these limits as the user base grows, we can upgrade to the "Pro" plan, which starts at **$25 / month**, offering 8GB of database space, 250GB of bandwidth, and automated daily backups.

## 4. Advantages and Limitations

### Advantages
- **Fully Managed**: Eliminates the overhead of maintaining database infrastructure, handling backups, and applying security patches.
- **Open Source & Portable**: Unlike proprietary NoSQL databases, using standard PostgreSQL means no vendor lock-in. We can easily export our data and host the database elsewhere if needed.
- **Direct Postgres Access**: Supabase allows direct SQL access, giving us the freedom to write custom Postgres functions, triggers, and complex views if our application logic requires it.
- **Integrated Tooling**: The provided direct and pooled connection strings make it easy to separate migration traffic from standard application queries.

### Limitations
- **Free Tier Sleep Mode**: Projects on the free tier are paused after a period of inactivity (typically 1 week) to conserve resources. Waking it up can take a few minutes upon the first request.
- **Connection Limits**: Even with pooling, the free tier has strict limits on concurrent direct connections. Sudden massive spikes in traffic could lead to connection timeouts if not managed properly.
- **Migration Complexity**: Managing database schemas across local development, staging, and production environments requires a disciplined approach (e.g., using Prisma Migrate) compared to simpler schema-less database solutions.
