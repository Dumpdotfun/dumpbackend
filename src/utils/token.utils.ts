import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');

export const checkTokenHoldings = async (tokenAddress: string, userWallet: string): Promise<number> => {
  try {
    const tokenPublicKey = new PublicKey(tokenAddress);
    const userPublicKey = new PublicKey(userWallet);

    // Get all token accounts for the user
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      userPublicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    // Find the specific token account
    const tokenAccount = tokenAccounts.value.find(
      account => account.account.data.parsed.info.mint === tokenAddress
    );

    if (!tokenAccount) {
      return 0;
    }

    // Get token supply
    const tokenSupply = await connection.getTokenSupply(tokenPublicKey);
    const totalSupply = Number(tokenSupply.value.amount) / Math.pow(10, tokenSupply.value.decimals);

    // Get user balance
    const userBalance = Number(tokenAccount.account.data.parsed.info.tokenAmount.amount) / 
      Math.pow(10, tokenAccount.account.data.parsed.info.tokenAmount.decimals);

    // Calculate percentage
    return (userBalance / totalSupply) * 100;
  } catch (error) {
    console.error('Error checking token holdings:', error);
    return 0;
  }
}; 