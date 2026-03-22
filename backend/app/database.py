import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


DB_PATH = Path(__file__).resolve().parent.parent / "cardsentry.db"


def _connect() -> sqlite3.Connection:
	conn = sqlite3.connect(DB_PATH)
	conn.row_factory = sqlite3.Row
	return conn


def init_db() -> None:
	with _connect() as conn:
		conn.execute(
			"""
			CREATE TABLE IF NOT EXISTS bin_cache (
				bin TEXT PRIMARY KEY,
				data TEXT NOT NULL,
				fetched_at TEXT NOT NULL
			)
			"""
		)
		conn.execute(
			"""
			CREATE TABLE IF NOT EXISTS gen_history (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				number TEXT NOT NULL,
				exp_month INTEGER NOT NULL,
				exp_year INTEGER NOT NULL,
				cvv TEXT NOT NULL,
				brand TEXT NOT NULL,
				type TEXT NOT NULL,
				created_at TEXT NOT NULL
			)
			"""
		)


def get_cached_bin(bin_number: str) -> dict[str, Any] | None:
	with _connect() as conn:
		row = conn.execute(
			"SELECT data FROM bin_cache WHERE bin = ?",
			(bin_number,),
		).fetchone()
	if not row:
		return None
	return json.loads(row["data"])


def set_cached_bin(bin_number: str, data: dict[str, Any]) -> None:
	timestamp = datetime.now(timezone.utc).isoformat()
	payload = json.dumps(data)
	with _connect() as conn:
		conn.execute(
			"""
			INSERT INTO bin_cache (bin, data, fetched_at)
			VALUES (?, ?, ?)
			ON CONFLICT(bin) DO UPDATE SET
				data = excluded.data,
				fetched_at = excluded.fetched_at
			""",
			(bin_number, payload, timestamp),
		)


def store_generated_cards(cards: list[dict[str, Any]]) -> None:
	if not cards:
		return
	timestamp = datetime.now(timezone.utc).isoformat()
	rows = [
		(
			card["number"],
			card["exp_month"],
			card["exp_year"],
			card["cvv"],
			card["brand"],
			card["type"],
			timestamp,
		)
		for card in cards
	]
	with _connect() as conn:
		conn.executemany(
			"""
			INSERT INTO gen_history (number, exp_month, exp_year, cvv, brand, type, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?)
			""",
			rows,
		)


def get_generation_history(limit: int = 100) -> list[dict[str, Any]]:
	safe_limit = max(1, min(limit, 500))
	with _connect() as conn:
		rows = conn.execute(
			"""
			SELECT number, exp_month, exp_year, cvv, brand, type, created_at
			FROM gen_history
			ORDER BY id DESC
			LIMIT ?
			""",
			(safe_limit,),
		).fetchall()
	return [dict(row) for row in rows]

