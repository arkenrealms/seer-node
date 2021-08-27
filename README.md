git init && git lfs install && git remote add origin git@github.com-cache:RuneFarm/cache.git && git add -A && git commit -m "build: Binzy doz it"


git push -f --set-upstream origin master


Upload

gcloud compute scp ~/projects/rune-databaser/db/evolution/europe1/leaderboardHistory.json  rune-databaser:/projects/rune-databaser/db/evolution/europe1/leaderboardHistory.json --zone "us-east4-b"  --project "rune-evolution-ptr"


Download

gcloud compute scp rune-databaser:/projects/rune-databaser/db/evolution/europe1/leaderboardHistory.json ~/projects/rune-databaser/db/evolution/europe1/ --zone "us-east4-b"  --project "rune-evolution-ptr"