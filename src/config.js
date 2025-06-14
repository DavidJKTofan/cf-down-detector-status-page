// src/config.js

export const endpoints = {
	cloudflare: {
		name: 'Cloudflare',
		urls: [
			{
				url: 'https://www.cloudflare.com/',
				description: 'Cloudflare Homepage',
			},
			{
				url: 'https://one.dash.cloudflare.com/',
				description: 'Cloudflare Zero Trust',
			},
		],
	},
	zscaler: {
		name: 'Zscaler',
		urls: [
			{
				url: 'https://admin.zscaler.net/',
				description: 'Zscaler Admin Portal',
			},
			{
				url: 'https://admin.zscalerone.net/',
				description: 'Zscaler One',
			},
			{
				url: 'https://admin.zscalertwo.net/',
				description: 'Zscaler Two',
			},
			{
				url: 'https://admin.zscalerthree.net/',
				description: 'Zscaler Three',
			},
			{
				url: 'https://admin.zscalerbeta.net/',
				description: 'Zscaler Beta',
			},
			{
				url: 'https://admin.zscloud.net/',
				description: 'Zscaler Cloud',
			},
			{
				url: 'https://admin.private.zscaler.com/',
				description: 'Zscaler Private',
			},
			{
				url: 'https://admin.zpatwo.net/',
				description: 'ZPA Two',
			},
		],
	},
	cato: {
		name: 'Cato Networks',
		urls: [
			{
				url: 'https://auth.catonetworks.com/',
				description: 'Cato Management Portal',
			},
		],
	},
	netskope: {
		name: 'Netskope',
		urls: [
			{
				url: 'https://netskope.goskope.com/ns#/login',
				description: 'Netskope Security Cloud',
			},
		],
	},
	forcepoint: {
		name: 'Forcepoint',
		urls: [
			{
				url: 'https://admin.forcepoint.net/login/login_form.mhtml',
				description: 'Forcepoint Admin Portal',
			},
		],
	},
	fastly: {
		name: 'Fastly',
		urls: [
			{
				url: 'https://manage.fastly.com/',
				description: 'Fastly Management Portal',
			},
		],
	},
	akamai: {
		name: 'Akamai',
		urls: [
			{
				url: 'https://control.akamai.com/apps/auth/#/login',
				description: 'Akamai Control Center',
			},
		],
	},
	linode: {
		name: 'Linode',
		urls: [
			{
				url: 'https://login.linode.com/login',
				description: 'Linode Cloud Manager',
			},
		],
	},
};
