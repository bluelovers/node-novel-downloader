/**
 * Created by user on 2020/1/6.
 */
import { parse } from '../index';

let tests = [
	/*
{
  url: 'https://12243.mitemin.net/userpageimage/viewimagebig/icode/i366014/',
  fullsize: 'https://12243.mitemin.net/userpageimage/viewimagebig/icode/i366014/',
  size: 'big',
  icode: 'i366014'
}
	 */
	'https://12243.mitemin.net/userpageimage/viewimagebig/icode/i366014/',
	/*
{
  url: 'https://img1.mitemin.net/cv/po/bcxka2bnheig0k9hc67bh6orl_177v_1kw_146_7bey.jpg.580.jpg',
  fullsize: 'https://img1.mitemin.net/cv/po/bcxka2bnheig0k9hc67bh6orl_177v_1kw_146_7bey.jpg.580.jpg',
  size: undefined,
  filename: 'bcxka2bnheig0k9hc67bh6orl_177v_1kw_146_7bey.jpg.580.jpg'
}
	 */
	'https://img1.mitemin.net/cv/po/bcxka2bnheig0k9hc67bh6orl_177v_1kw_146_7bey.jpg.580.jpg',
	/*
{
  url: 'https://img1.mitemin.net/k0/78/84kqizdv2mupf8n135o55zfol2wb_xan_by_go_2f0x.jpg',
  fullsize: 'https://img1.mitemin.net/k0/78/84kqizdv2mupf8n135o55zfol2wb_xan_by_go_2f0x.jpg',
  size: undefined,
  filename: '84kqizdv2mupf8n135o55zfol2wb_xan_by_go_2f0x.jpg'
}
	 */
	'https://img1.mitemin.net/k0/78/84kqizdv2mupf8n135o55zfol2wb_xan_by_go_2f0x.jpg',
];

tests.forEach(v => console.dir(parse(v)));



