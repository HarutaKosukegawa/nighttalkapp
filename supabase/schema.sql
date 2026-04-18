-- 参加者テーブル
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  event_date date not null,
  name text not null,
  activity text not null,
  dream text not null,
  concern text not null,
  want_to_talk text not null,
  outfit_photo_url text,
  created_at timestamptz default now()
);

-- 話したいリクエストテーブル
create table if not exists talk_requests (
  id uuid primary key default gen_random_uuid(),
  from_participant_id uuid not null references participants(id) on delete cascade,
  to_participant_id uuid not null references participants(id) on delete cascade,
  event_date date not null,
  created_at timestamptz default now(),
  unique(from_participant_id, to_participant_id)
);

-- インデックス
create index if not exists idx_participants_event_date on participants(event_date);
create index if not exists idx_talk_requests_to on talk_requests(to_participant_id);
create index if not exists idx_talk_requests_from on talk_requests(from_participant_id);

-- RLS（Row Level Security）を有効化
alter table participants enable row level security;
alter table talk_requests enable row level security;

-- 全員が読み書きできるポリシー（イベントアプリなので認証不要）
create policy "participants_select" on participants for select using (true);
create policy "participants_insert" on participants for insert with check (true);
create policy "participants_update" on participants for update using (true);

create policy "talk_requests_select" on talk_requests for select using (true);
create policy "talk_requests_insert" on talk_requests for insert with check (true);

-- Storageバケット作成（SQL Editorでは実行できないためダッシュボードで行う）
-- バケット名: outfits、Public: true
