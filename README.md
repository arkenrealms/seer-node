git init && git lfs install && git remote add origin git@github.com-cache:RuneFarm/cache.git && git add -A && git commit -m "build: Binzy doz it"


git push -f --set-upstream origin master


Upload

gcloud compute scp ~/projects/rune-databaser/db/evolution/europe1/leaderboardHistory.json  rune-databaser:/projects/rune-databaser/db/evolution/europe1/leaderboardHistory.json --zone "us-east4-b"  --project "rune-evolution-ptr"


Download

gcloud compute scp rune-databaser:/projects/rune-databaser/db/evolution/europe1/leaderboardHistory.json ~/projects/rune-databaser/db/evolution/europe1/ --zone "us-east4-b"  --project "rune-evolution-ptr"


Download Drive files

wget --load-cookies /tmp/cookies.txt "https://docs.google.com/uc?export=download&confirm=$(wget --quiet --save-cookies /tmp/cookies.txt --keep-session-cookies --no-check-certificate 'https://docs.google.com/uc?export=download&id=1v1iAOWOfDZCNapvHzgZOfVCBU0Hlx2RJ' -O- | sed -rn 's/.*confirm=([0-9A-Za-z_]+).*/\1\n/p')&id=1v1iAOWOfDZCNapvHzgZOfVCBU0Hlx2RJ" -O guiding-light.zip && rm -rf /tmp/cookies.txt && unzip guiding-light.zip && rm guiding-light.zip && rm -rf __MACOSX