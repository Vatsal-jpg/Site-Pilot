// backend/utils/github.js
import { Octokit } from "@octokit/rest"; // npm install @octokit/rest

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export const pushToGithub = async (project) => {
    const owner = "Menil-dev";
    const repo = `site-${project.slug}`;

    // 1. Ensure the repo exists (using your token from .env)
    try {
        await octokit.repos.get({ owner, repo });
    } catch (e) {
        await octokit.repos.createForAuthenticatedUser({ name: repo, auto_init: true });
        await new Promise(r => setTimeout(r, 2000)); // Wait for initialization
    }

    // 2. Prepare the 'dist' folder content from database pages
    const files = project.sitePages.map(page => {
        const htmlBody = page.customHtml || '<h1>Page Under Construction</h1>';
        const css = page.customCss || '';
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.name || project.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; }
    ${css}
  </style>
</head>
<body>
${htmlBody}
</body>
</html>`;
        return {
            path: `dist/${page.isHome ? 'index.html' : `${page.slug.replace(/\//g, '')}.html`}`,
            content: fullHtml
        };
    });

    // 3. Get the current commit SHA to branch off of
    const { data: ref } = await octokit.git.getRef({ owner, repo, ref: 'heads/main' });

    // 4. Create a new Tree and Commit with your 'dist' files
    const { data: tree } = await octokit.git.createTree({
        owner, repo, base_tree: ref.object.sha,
        tree: files.map(f => ({ path: f.path, mode: '100644', type: 'blob', content: f.content }))
    });

    const { data: commit } = await octokit.git.createCommit({
        owner, repo, message: 'Publishing site files', tree: tree.sha, parents: [ref.object.sha]
    });

    // 5. Update the reference (the actual "Push")
    await octokit.git.updateRef({ owner, repo, ref: 'heads/main', sha: commit.sha });

    return `https://github.com/${owner}/${repo}.git`;
};